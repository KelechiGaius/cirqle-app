import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Users, User, MapPin, Send, ArrowLeft, Edit2, Check, Trophy, Star, Calendar, LogOut, Mail, Lock, Camera, X } from 'lucide-react';
import { supabase } from './supabaseClient';

const colors = {
  lightBlue: '#7BB9FF',
  primary: '#5B9BD5',
  deepBlue: '#2E5C8A',
  white: '#FFFFFF',
  background: '#F8F9FA'
};

const INTERESTS = [
  'Sports', 'Coffee & Cafés', 'Fitness & Gym', 'Art & Culture', 
  'Nightlife', 'Running', 'Walking', 'Study Groups',
  'Music', 'Cooking', 'Gaming', 'Photography'
];

const ACTIVITY_DATABASE = {
  'Sports': [
    { id: 'sp1', title: 'Soccer Match', description: 'Play a friendly soccer game', price: 'Free', emoji: '⚽', location: 'Park Saint-Antoine', time: '18:00' },
    { id: 'sp2', title: 'Tennis Session', description: 'Doubles tennis', price: '€10/person', emoji: '🎾', location: 'Tennis Club', time: '16:00' }
  ],
  'Coffee & Cafés': [
    { id: 'cf1', title: 'Coffee Tasting', description: 'Try different varieties', price: '€12/person', emoji: '☕', location: 'Café Bellecour', time: '15:00' },
    { id: 'cf2', title: 'Café Brunch', description: 'Weekend brunch', price: '€18/person', emoji: '🥐', location: 'Le Bistro', time: '11:00' }
  ],
  'Fitness & Gym': [
    { id: 'gym1', title: 'Group Workout', description: 'HIIT training', price: '€15/person', emoji: '💪', location: 'FitHub', time: '19:00' },
    { id: 'gym2', title: 'Yoga Class', description: 'Relaxing yoga', price: '€12/person', emoji: '🧘', location: 'Zen Studio', time: '18:30' }
  ],
  'Art & Culture': [
    { id: 'art1', title: 'Museum Visit', description: 'Explore art', price: '€8/person', emoji: '🎨', location: 'Art Museum', time: '14:00' },
    { id: 'art2', title: 'Painting Workshop', description: 'Create art', price: '€25/person', emoji: '🖼️', location: 'Art Studio', time: '16:00' }
  ],
  'Nightlife': [
    { id: 'nl1', title: 'Bar Crawl', description: 'Visit local bars', price: '€20/person', emoji: '🍻', location: 'City Center', time: '21:00' },
    { id: 'nl2', title: 'Live Music', description: 'Concert night', price: '€15/person', emoji: '🎵', location: 'Music Hall', time: '20:00' }
  ],
  'Running': [
    { id: 'run1', title: 'Morning Run', description: 'Group run', price: 'Free', emoji: '🏃', location: 'River Path', time: '07:00' },
    { id: 'run2', title: '5K Challenge', description: 'Train together', price: 'Free', emoji: '🏅', location: 'City Park', time: '08:00' }
  ],
  'Walking': [
    { id: 'wk1', title: 'City Walk', description: 'Explore neighborhoods', price: 'Free', emoji: '🚶', location: 'Old Town', time: '14:00' },
    { id: 'wk2', title: 'Nature Hike', description: 'Hiking nearby', price: 'Free', emoji: '🥾', location: 'Hills', time: '10:00' }
  ],
  'Study Groups': [
    { id: 'sg1', title: 'Study Session', description: 'Co-working', price: 'Free', emoji: '📚', location: 'Library', time: '14:00' },
    { id: 'sg2', title: 'Library Meetup', description: 'Study together', price: 'Free', emoji: '📖', location: 'Central Library', time: '15:00' }
  ],
  'Music': [
    { id: 'mus1', title: 'Concert Night', description: 'Live music', price: '€20/person', emoji: '🎸', location: 'Concert Hall', time: '20:00' },
    { id: 'mus2', title: 'Karaoke Night', description: 'Sing together', price: '€12/person', emoji: '🎤', location: 'Karaoke Bar', time: '19:00' }
  ],
  'Cooking': [
    { id: 'cook1', title: 'Cooking Class', description: 'Learn to cook', price: '€35/person', emoji: '👨‍🍳', location: 'Cooking School', time: '18:00' },
    { id: 'cook2', title: 'Dinner Party', description: 'Cook together', price: '€15/person', emoji: '🍽️', location: 'Private Kitchen', time: '19:00' }
  ],
  'Gaming': [
    { id: 'gm1', title: 'Game Night', description: 'Board games', price: '€10/person', emoji: '🎮', location: 'Game Café', time: '19:00' },
    { id: 'gm2', title: 'E-Sports Viewing', description: 'Watch tournament', price: 'Free', emoji: '🕹️', location: 'Gaming Café', time: '17:00' }
  ],
  'Photography': [
    { id: 'ph1', title: 'Photo Walk', description: 'Explore and photograph', price: 'Free', emoji: '📷', location: 'Downtown', time: '16:00' },
    { id: 'ph2', title: 'Photo Workshop', description: 'Learn photography', price: '€30/person', emoji: '📸', location: 'Photo Studio', time: '14:00' }
  ]
};

const generateDateOptions = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      id: `date${i}`,
      date: date,
      display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    });
  }
  
  return dates;
};

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [screen, setScreen] = useState('welcome');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userData, setUserData] = useState({ name: '', age: '', photo: null, city: '', interests: [] });
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCircle, setCurrentCircle] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [votingActivities, setVotingActivities] = useState([]);
  const [currentVotingIndex, setCurrentVotingIndex] = useState(0);
  const [userVotes, setUserVotes] = useState({});
  const [showMatchingNotification, setShowMatchingNotification] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winningActivity, setWinningActivity] = useState(null);
  const [dateOptions, setDateOptions] = useState([]);
  const [dateVotes, setDateVotes] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePoll, setShowDatePoll] = useState(false);
  const [showEventConfirmation, setShowEventConfirmation] = useState(false);
  const [bottomNav, setBottomNav] = useState('circle');
  
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  
  // ✨ NEU: Match Reveal States
  const [showMatchReveal, setShowMatchReveal] = useState(false);
  const [matchedMembers, setMatchedMembers] = useState([]);
  const [revealCardIndex, setRevealCardIndex] = useState(0);
  
  const chatEndRef = useRef(null);
  const messagesSubscription = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setLoading(false);
        setScreen('onboarding');
        return;
      }

      if (data) {
        setCurrentUser(data);
        setUserData({
          name: data.name,
          age: data.age?.toString(),
          photo: data.photo_url,
          city: data.city,
          interests: data.interests || []
        });
        
        await loadUserCircle(userId);
        setScreen('home');
      } else {
        setScreen('onboarding');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
      setScreen('onboarding');
    }
  };

  const loadUserCircle = async (userId) => {
    try {
      console.log('🔍 Loading circle for user:', userId);
      
      const { data: membership, error: memberError } = await supabase
        .from('circle_members')
        .select('circle_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error loading membership:', memberError);
        return;
      }

      if (!membership) {
        console.log('No circle membership found');
        return;
      }

      console.log('✅ Found circle_id:', membership.circle_id);

      const { data: circle, error: circleError } = await supabase
        .from('circles')
        .select('*')
        .eq('id', membership.circle_id)
        .single();

      if (circleError) {
        console.error('Error loading circle:', circleError);
        return;
      }

      console.log('✅ Circle loaded:', circle);

      const { data: membersData, error: membersError } = await supabase
        .from('circle_members')
        .select(`
          user_id,
          users (
            id,
            name,
            age,
            photo_url,
            interests
          )
        `)
        .eq('circle_id', membership.circle_id);

      if (membersError) {
        console.error('Error loading members:', membersError);
        return;
      }

      console.log('✅ Raw members data:', membersData);

      const membersList = membersData?.map(m => ({
        id: m.users.id,
        name: m.users.name,
        age: m.users.age,
        photo: m.users.photo_url,
        interests: m.users.interests
      })) || [];

      console.log('✅ Processed members list:', membersList);

      setCurrentCircle({
        ...circle,
        members: membersList
      });
      
      console.log('✅ Circle set with', membersList.length, 'members');
    } catch (error) {
      console.error('❌ Error in loadUserCircle:', error);
    }
  };

  // 🔥 VERBESSERT: Real-time Chat mit Duplikat-Prävention
  useEffect(() => {
    if (!currentCircle) {
      console.log('No circle, skipping messages subscription');
      return;
    }

    console.log('🔥 Setting up real-time messages for circle:', currentCircle.id);
    
    loadMessages();

    const channel = supabase
      .channel(`messages:${currentCircle.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `circle_id=eq.${currentCircle.id}` 
        },
        (payload) => {
          console.log('✅ New message received:', payload.new);
          const newMessage = payload.new;
          
          // WICHTIG: Verhindert Duplikate
          setMessages(prev => {
            const exists = prev.find(m => m.id === newMessage.id);
            if (exists) {
              console.log('Message already exists, skipping');
              return prev;
            }
            
            return [...prev, {
              id: newMessage.id,
              user: newMessage.sender_name || 'Unknown',
              text: newMessage.text,
              userId: newMessage.user_id,
              timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            }];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to messages');
        }
      });

    messagesSubscription.current = channel;

    return () => {
      console.log('Cleaning up messages subscription');
      if (messagesSubscription.current) {
        supabase.removeChannel(messagesSubscription.current);
      }
    };
  }, [currentCircle?.id]); // NUR wenn circle ID sich ändert

  const loadMessages = async () => {
    if (!currentCircle) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('circle_id', currentCircle.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data.map(msg => ({
        id: msg.id,
        user: msg.sender_name,
        text: msg.text,
        userId: msg.user_id,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentCircle || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          circle_id: currentCircle.id,
          user_id: currentUser.id,
          sender_name: currentUser.name,
          text: messageInput
        }]);

      if (error) throw error;

      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const { error } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password
      });

      if (error) throw error;

      alert('Check your email for verification!');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password
      });

      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentCircle(null);
    setScreen('auth');
  };

  const completeOnboarding = async () => {
    if (!userData.name || !userData.age || !userData.city || userData.interests.length < 3) {
      alert('Please complete all fields and select at least 3 interests');
      return;
    }

    console.log('🚀 Starting completeOnboarding...');

    if (!session || !session.user || !session.user.id) {
      console.error('❌ Invalid session!');
      alert('Invalid session. Please login again.');
      setScreen('auth');
      return;
    }

    console.log('✅ Session valid, user ID:', session.user.id);

    try {
      setLoading(true);

      let user = currentUser;
      
      if (!user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (existingUser) {
          user = existingUser;
          setCurrentUser(user);
        } else {
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              name: userData.name,
              age: parseInt(userData.age),
              photo_url: userData.photo || '👤',
              city: userData.city,
              interests: userData.interests
            }])
            .select()
            .single();

          if (userError) throw userError;
          user = newUser;
          setCurrentUser(user);
        }
      }

      const { data: allCircles, error: circlesError } = await supabase
        .from('circles')
        .select('*')
        .eq('status', 'active');

      if (circlesError) throw circlesError;

      let matchedCircle = null;

      if (allCircles && allCircles.length > 0) {
        for (const circle of allCircles) {
          const { count } = await supabase
            .from('circle_members')
            .select('*', { count: 'exact', head: true })
            .eq('circle_id', circle.id);

          console.log(`Circle ${circle.id}: ${count} members`);

          if (count < 2) {
            const overlap = calculateInterestOverlap(userData.interests, circle.top_interests || []);
            console.log(`Interest overlap: ${overlap}`);
            
            if (overlap >= 2) {
              matchedCircle = circle;
              break;
            }
          }
        }
      }

      if (matchedCircle) {
        console.log('✅ Matched circle found:', matchedCircle.id);
        
        await supabase
          .from('circle_members')
          .insert([{
            circle_id: matchedCircle.id,
            user_id: user.id
          }]);

        const { data: members } = await supabase
          .from('circle_members')
          .select(`
            user_id,
            users (*)
          `)
          .eq('circle_id', matchedCircle.id);

        const membersList = members?.map(m => ({
          id: m.users.id,
          name: m.users.name,
          age: m.users.age,
          photo: m.users.photo_url,
          interests: m.users.interests
        })) || [];

        setCurrentCircle({
          ...matchedCircle,
          members: membersList
        });
      } else {
        console.log('No match found, creating new circle');
        
        const topInterests = userData.interests.slice(0, 3);

        const { data: newCircle, error: createError } = await supabase
          .from('circles')
          .insert([{
            city: userData.city,
            top_interests: topInterests,
            status: 'active'
          }])
          .select()
          .single();

        if (createError) throw createError;

        await supabase
          .from('circle_members')
          .insert([{
            circle_id: newCircle.id,
            user_id: user.id
          }]);

        setCurrentCircle({
          ...newCircle,
          members: [{
            id: user.id,
            name: user.name,
            age: user.age,
            photo: user.photo_url,
            interests: user.interests
          }]
        });
      }

      const activities = [];
      const topInt = matchedCircle?.top_interests || userData.interests.slice(0, 3);
      topInt.forEach(interest => {
        if (ACTIVITY_DATABASE[interest]) {
          activities.push(...ACTIVITY_DATABASE[interest]);
        }
      });

      setVotingActivities(activities.slice(0, 8));

      setShowMatchingNotification(true);
      setTimeout(() => {
        setShowMatchingNotification(false);
        setScreen('voting');
        setLoading(false);
      }, 3000);

    } catch (error) {
      console.error('❌ Error creating circle:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  const calculateInterestOverlap = (interests1, interests2) => {
    return interests1.filter(i => interests2.includes(i)).length;
  };

  const voteForActivity = (activityId, rating) => {
    console.log(`🗳️ Voted for ${activityId} with ${rating} stars`);
    const newVotes = { ...userVotes, [activityId]: rating };
    setUserVotes(newVotes);

    if (currentVotingIndex < votingActivities.length - 1) {
      console.log(`Moving to next activity (${currentVotingIndex + 1}/${votingActivities.length})`);
      setCurrentVotingIndex(currentVotingIndex + 1);
    } else {
      console.log('🏁 LAST VOTE! Calling finishVoting...');
      finishVoting(newVotes);
    }
  };

  // 🔥 VERBESSERT: Voting Flow ohne setTimeout
  const finishVoting = async (finalUserVotes) => {
    try {
      console.log('🔥 Starting finishVoting...');
      
      const allVotes = {};
      
      votingActivities.forEach(activity => {
        const userVote = finalUserVotes[activity.id] || 3;
        const votes = [userVote];
        
        for (let i = 0; i < 3; i++) {
          votes.push(Math.floor(Math.random() * 4) + 1);
        }
        
        const average = votes.reduce((a, b) => a + b, 0) / votes.length;
        allVotes[activity.id] = average;
      });

      let highestScore = 0;
      let winner = null;

      Object.entries(allVotes).forEach(([activityId, score]) => {
        if (score > highestScore) {
          highestScore = score;
          winner = votingActivities.find(a => a.id === activityId);
        }
      });

      if (!winner) {
        console.error('❌ No winner found! Using first activity');
        winner = votingActivities[0];
        highestScore = 4;
      }

      const winnerWithScore = { ...winner, score: highestScore.toFixed(1) };
      
      // KRITISCH: Setze state SYNCHRON, kein setTimeout!
      setWinningActivity(winnerWithScore);
      setShowWinnerModal(true);
      
      console.log('✅ Winner modal should now be visible:', winnerWithScore.title);

      // Speichere in Datenbank im Hintergrund
      if (currentCircle && currentUser) {
        try {
          const votesToSave = Object.entries(finalUserVotes).map(([activityId, rating]) => ({
            circle_id: currentCircle.id,
            user_id: currentUser.id,
            activity_id: activityId,
            rating: rating
          }));

          await supabase.from('votes').insert(votesToSave);
          
          await supabase
            .from('circles')
            .update({ 
              winning_activity: winner.id,
              winning_activity_data: winner 
            })
            .eq('id', currentCircle.id);
            
          console.log('✅ Votes and winner saved to database');
        } catch (err) {
          console.warn('⚠️ Database save failed (non-critical):', err);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in finishVoting:', error);
      if (votingActivities.length > 0) {
        setWinningActivity({ ...votingActivities[0], score: '4.0' });
        setShowWinnerModal(true);
      }
    }
  };

  // 🔥 VERBESSERT: Start Date Poll mit Match Reveal
  const startDatePoll = () => {
    console.log('Starting date poll...');
    const dates = generateDateOptions();
    setDateOptions(dates);
    setShowWinnerModal(false);
    
    // Zeige Match Reveal Modal
    if (currentCircle && currentCircle.members) {
      const otherMembers = currentCircle.members.filter(m => m.id !== currentUser?.id);
      setMatchedMembers(otherMembers);
      setRevealCardIndex(0);
      setShowMatchReveal(true);
    } else {
      // Fallback falls keine Members
      setShowDatePoll(true);
      setScreen('chat');
    }
  };

  const voteForDate = async (dateId) => {
    try {
      console.log('🔥 Starting voteForDate...');
      
      const allVotes = { [dateId]: 4 };
      dateOptions.forEach(opt => {
        if (opt.id !== dateId) {
          allVotes[opt.id] = Math.floor(Math.random() * 3);
        }
      });

      let highestVote = 0;
      let winningDateId = null;

      Object.entries(allVotes).forEach(([id, vote]) => {
        if (vote > highestVote) {
          highestVote = vote;
          winningDateId = id;
        }
      });

      const finalDate = dateOptions.find(d => d.id === winningDateId);
      setSelectedDate(finalDate);
      setShowDatePoll(false);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShowEventConfirmation(true);
      console.log('✅ Event confirmation shown');

    } catch (error) {
      console.error('❌ Error in voteForDate:', error);
    }
  };

  const toggleInterest = (interest) => {
    setUserData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setUserData(prev => ({ ...prev, photo: data.publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo');
    }
  };

  // ✨ NEU: Match Reveal Modal Component
  const MatchRevealModal = () => {
    if (!showMatchReveal || !matchedMembers.length) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          color: colors.white,
          marginBottom: '40px'
        }}>
          <h1 style={{ 
            fontSize: '32px', 
            marginBottom: '10px',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            You're in! 🎉
          </h1>
          <p style={{ fontSize: '18px', color: '#B0D4FF' }}>
            Matched with {matchedMembers.length} {matchedMembers.length === 1 ? 'person' : 'people'} who share your interests
          </p>
        </div>
        
        <div style={{
          width: '100%',
          maxWidth: '400px',
          height: '500px',
          position: 'relative'
        }}>
          {matchedMembers.map((member, index) => (
            <div
              key={member.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.white,
                borderRadius: '24px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transform: index === revealCardIndex ? 'scale(1)' : 'scale(0.95)',
                opacity: index === revealCardIndex ? 1 : 0,
                transition: 'all 0.3s ease-out',
                pointerEvents: index === revealCardIndex ? 'auto' : 'none'
              }}
            >
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                border: `4px solid ${colors.primary}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                backgroundColor: colors.background
              }}>
                {member.photo || '👤'}
              </div>
              
              <h2 style={{ 
                fontSize: '28px', 
                fontWeight: 'bold',
                marginBottom: '5px',
                color: colors.deepBlue
              }}>
                {member.name}
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#666',
                marginBottom: '25px'
              }}>
                {member.age} years old
              </p>
              
              <div style={{ marginBottom: '30px' }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#888',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Shared Interests
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  {(member.interests || []).slice(0, 3).map(interest => (
                    <span key={interest} style={{
                      backgroundColor: colors.lightBlue,
                      color: colors.white,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '30px'
              }}>
                {matchedMembers.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: i === revealCardIndex ? colors.primary : '#ddd',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{
          marginTop: '30px',
          display: 'flex',
          gap: '15px'
        }}>
          {revealCardIndex > 0 && (
            <button
              onClick={() => setRevealCardIndex(revealCardIndex - 1)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: `2px solid ${colors.primary}`,
                backgroundColor: 'transparent',
                color: colors.white,
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ← Previous
            </button>
          )}
          
          {revealCardIndex < matchedMembers.length - 1 ? (
            <button
              onClick={() => setRevealCardIndex(revealCardIndex + 1)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: colors.primary,
                color: colors.white,
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                setShowMatchReveal(false);
                setShowDatePoll(true);
                setScreen('chat');
              }}
              style={{
                padding: '15px 40px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: colors.primary,
                color: colors.white,
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(91, 155, 213, 0.4)'
              }}
            >
              Continue to Date Selection →
            </button>
          )}
        </div>
      </div>
    );
  };

  const MatchingNotification = () => {
    if (!showMatchingNotification) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ textAlign: 'center', color: colors.white }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</h1>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>Finding your Cirqle...</h2>
          <p style={{ fontSize: '18px', color: '#B0D4FF' }}>Matching based on your interests</p>
        </div>
      </div>
    );
  };

  const WinnerModal = () => {
    if (!showWinnerModal || !winningActivity) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Trophy size={64} color={colors.primary} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '28px', marginBottom: '10px', color: colors.deepBlue }}>
            Winner!
          </h2>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            {winningActivity.emoji}
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: colors.deepBlue }}>
            {winningActivity.title}
          </h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '10px' }}>
            {winningActivity.description}
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px',
            backgroundColor: colors.background,
            padding: '8px 16px',
            borderRadius: '20px',
            marginBottom: '20px'
          }}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <span style={{ fontWeight: 'bold', color: colors.primary }}>
              {winningActivity.score}
            </span>
            <span style={{ color: '#666' }}>/ 4.0</span>
          </div>
          <button
            onClick={startDatePoll}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: colors.primary,
              color: colors.white,
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Pick a Date →
          </button>
        </div>
      </div>
    );
  };

  const MatchAnimationModal = () => {
    if (!showMatchAnimation) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{ textAlign: 'center', color: colors.white }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✨</h1>
          <h2 style={{ fontSize: '32px', marginBottom: '10px' }}>You matched!</h2>
          <p style={{ fontSize: '18px', color: '#B0D4FF' }}>Opening chat...</p>
        </div>
      </div>
    );
  };

  const EventConfirmationModal = () => {
    if (!showEventConfirmation || !winningActivity || !selectedDate) return null;
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: colors.white,
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          <Calendar size={64} color={colors.primary} style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '28px', marginBottom: '20px', color: colors.deepBlue }}>
            Event Confirmed! 🎉
          </h2>
          <div style={{
            backgroundColor: colors.background,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <span style={{ fontSize: '32px' }}>{winningActivity.emoji}</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: colors.deepBlue }}>
              {winningActivity.title}
            </h3>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              📅 {selectedDate.display} at {winningActivity.time}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              📍 {winningActivity.location}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              💰 {winningActivity.price}
            </div>
          </div>
          <button
            onClick={() => {
              setShowEventConfirmation(false);
              setScreen('chat');
            }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: colors.primary,
              color: colors.white,
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  };

  const BottomNavigation = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.white,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '16px 0',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
    }}>
      <button
        onClick={() => { setScreen('home'); setBottomNav('home'); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: bottomNav === 'home' ? colors.primary : '#999'
        }}
      >
        <Users size={24} />
        <span style={{ fontSize: '12px' }}>Home</span>
      </button>
      <button
        onClick={() => { setScreen('chat'); setBottomNav('circle'); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: bottomNav === 'circle' ? colors.primary : '#999'
        }}
      >
        <MessageCircle size={24} />
        <span style={{ fontSize: '12px' }}>Chat</span>
      </button>
      <button
        onClick={() => { setScreen('profile'); setBottomNav('profile'); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: bottomNav === 'profile' ? colors.primary : '#999'
        }}
      >
        <User size={24} />
        <span style={{ fontSize: '12px' }}>Profile</span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭕</div>
          <p style={{ color: colors.primary, fontSize: '18px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (screen === 'welcome') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.primary }}>
      <div className="text-center">
        <h1 className="text-6xl mb-6" style={{ color: colors.white }}>⭕</h1>
        <h2 className="text-4xl font-bold mb-4" style={{ color: colors.white }}>CIRQLE</h2>
        <p className="text-xl mb-12" style={{ color: colors.white, opacity: 0.9 }}>
          Make friends through group activities
        </p>
        <button
          onClick={() => setScreen('auth')}
          className="px-8 py-4 rounded-full text-lg font-semibold"
          style={{ backgroundColor: colors.white, color: colors.primary }}
        >
          Get Started
        </button>
      </div>
    </div>
  );

  if (screen === 'auth') return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: colors.deepBlue }}>
          {authMode === 'login' ? 'Welcome Back' : 'Join CIRQLE'}
        </h1>

        <form onSubmit={authMode === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.deepBlue }}>Email</label>
            <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ backgroundColor: colors.white }}>
              <Mail size={20} color={colors.primary} />
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="flex-1 outline-none"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.deepBlue }}>Password</label>
            <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ backgroundColor: colors.white }}>
              <Lock size={20} color={colors.primary} />
              <input
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                className="flex-1 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {authError && (
            <p className="text-red-500 text-sm">{authError}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-full font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            {authMode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            className="font-semibold"
            style={{ color: colors.primary }}
          >
            {authMode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );

  if (screen === 'onboarding') return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{ backgroundColor: i <= onboardingStep ? colors.primary : '#E5E7EB' }}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Step {onboardingStep + 1} of 4</p>
        </div>

        {onboardingStep === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepBlue }}>What's your name?</h2>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full p-4 rounded-2xl mb-4"
              style={{ backgroundColor: colors.white }}
            />
            <button
              onClick={() => userData.name && setOnboardingStep(1)}
              disabled={!userData.name}
              className="w-full py-3 rounded-full font-semibold"
              style={{
                backgroundColor: userData.name ? colors.primary : '#E5E7EB',
                color: userData.name ? colors.white : '#999'
              }}
            >
              Continue
            </button>
          </div>
        )}

        {onboardingStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepBlue }}>How old are you?</h2>
            <input
              type="number"
              value={userData.age}
              onChange={(e) => setUserData({ ...userData, age: e.target.value })}
              placeholder="Age"
              className="w-full p-4 rounded-2xl mb-4"
              style={{ backgroundColor: colors.white }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setOnboardingStep(0)}
                className="flex-1 py-3 rounded-full font-semibold border-2"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Back
              </button>
              <button
                onClick={() => userData.age && setOnboardingStep(2)}
                disabled={!userData.age}
                className="flex-1 py-3 rounded-full font-semibold"
                style={{
                  backgroundColor: userData.age ? colors.primary : '#E5E7EB',
                  color: userData.age ? colors.white : '#999'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {onboardingStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepBlue }}>Add a photo</h2>
            <div className="text-center mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: colors.white,
                  border: `3px dashed ${colors.primary}`
                }}
              >
                {userData.photo ? (
                  <img src={userData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera size={48} color={colors.primary} />
                )}
              </div>
              <p className="text-sm text-gray-600">Tap to upload</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOnboardingStep(1)}
                className="flex-1 py-3 rounded-full font-semibold border-2"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Back
              </button>
              <button
                onClick={() => setOnboardingStep(3)}
                className="flex-1 py-3 rounded-full font-semibold"
                style={{ backgroundColor: colors.primary, color: colors.white }}
              >
                {userData.photo ? 'Continue' : 'Skip'}
              </button>
            </div>
          </div>
        )}

        {onboardingStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: colors.deepBlue }}>Where are you?</h2>
            <div className="flex items-center gap-2 p-4 rounded-2xl mb-4" style={{ backgroundColor: colors.white }}>
              <MapPin size={20} color={colors.primary} />
              <input
                type="text"
                value={userData.city}
                onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                placeholder="City"
                className="flex-1 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setOnboardingStep(2)}
                className="flex-1 py-3 rounded-full font-semibold border-2"
                style={{ borderColor: colors.primary, color: colors.primary }}
              >
                Back
              </button>
              <button
                onClick={() => userData.city && setScreen('interests')}
                disabled={!userData.city}
                className="flex-1 py-3 rounded-full font-semibold"
                style={{
                  backgroundColor: userData.city ? colors.primary : '#E5E7EB',
                  color: userData.city ? colors.white : '#999'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (screen === 'interests') return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: colors.background }}>
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>What are you into?</h2>
        <p className="text-gray-600 mb-6">Select at least 3 interests</p>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {INTERESTS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className="p-4 rounded-2xl font-medium text-left"
              style={{
                backgroundColor: userData.interests.includes(interest) ? colors.primary : colors.white,
                color: userData.interests.includes(interest) ? colors.white : colors.deepBlue
              }}
            >
              {interest}
            </button>
          ))}
        </div>

        <button
          onClick={completeOnboarding}
          disabled={userData.interests.length < 3}
          className="w-full py-3 rounded-full font-semibold"
          style={{
            backgroundColor: userData.interests.length >= 3 ? colors.primary : '#E5E7EB',
            color: userData.interests.length >= 3 ? colors.white : '#999'
          }}
        >
          Find My Cirqle ({userData.interests.length}/3)
        </button>
      </div>
    </div>
  );

  if (screen === 'voting') {
    const currentActivity = votingActivities[currentVotingIndex];
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-center text-sm text-gray-600 mb-2">
              Activity {currentVotingIndex + 1} of {votingActivities.length}
            </p>
            <div className="flex gap-1">
              {votingActivities.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full"
                  style={{ backgroundColor: i <= currentVotingIndex ? colors.primary : '#E5E7EB' }}
                />
              ))}
            </div>
          </div>

          {currentActivity && (
            <div className="p-8 rounded-3xl mb-6" style={{ backgroundColor: colors.white }}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{currentActivity.emoji}</div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>
                  {currentActivity.title}
                </h2>
                <p className="text-gray-600 mb-3">{currentActivity.description}</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span>📍 {currentActivity.location}</span>
                  <span>🕐 {currentActivity.time}</span>
                </div>
                <p className="mt-2 font-semibold" style={{ color: colors.primary }}>
                  {currentActivity.price}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-center font-medium mb-4" style={{ color: colors.deepBlue }}>
                  How interested are you?
                </p>
                {[4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => voteForActivity(currentActivity.id, rating)}
                    className="w-full p-4 rounded-2xl flex items-center justify-between"
                    style={{ backgroundColor: colors.background }}
                  >
                    <span style={{ color: colors.deepBlue }}>
                      {rating === 4 && "❤️ Love it!"}
                      {rating === 3 && "👍 Sounds good"}
                      {rating === 2 && "🤔 Maybe"}
                      {rating === 1 && "😐 Not really"}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} size={16} color={colors.primary} fill={colors.primary} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'chat') return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      <div className="p-4 flex items-center justify-between" style={{ backgroundColor: colors.white }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen('home')}>
            <ArrowLeft size={24} color={colors.primary} />
          </button>
          <div>
            <h2 className="font-bold" style={{ color: colors.deepBlue }}>Your Cirqle</h2>
            <p className="text-sm text-gray-600">{currentCircle?.members.length || 0} members</p>
          </div>
        </div>
        <button onClick={() => setScreen('members')}>
          <Users size={24} color={colors.primary} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentCircle?.members.map(member => (
              <div key={member.id} className="flex flex-col items-center min-w-[70px]">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-1"
                  style={{ backgroundColor: colors.white, border: `2px solid ${colors.primary}` }}
                >
                  {member.photo || '👤'}
                </div>
                <span className="text-xs text-center" style={{ color: colors.deepBlue }}>
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {winningActivity && selectedDate && (
          <div className="mb-6 p-5 rounded-3xl" style={{ backgroundColor: colors.primary }}>
            <div className="flex items-center gap-3 mb-3">
              <Trophy size={24} color={colors.white} />
              <p className="font-semibold text-white">Upcoming Event</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{winningActivity.emoji}</span>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white">{winningActivity.title}</h4>
                <p className="text-sm text-white opacity-90">{winningActivity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Calendar size={16} />
              <span className="text-sm">{selectedDate.display} at {winningActivity.time}</span>
            </div>
          </div>
        )}

        {showDatePoll && (
          <div className="mb-6 p-5 rounded-3xl" style={{ backgroundColor: colors.white }}>
            <h4 className="font-semibold mb-3" style={{ color: colors.deepBlue }}>📅 Pick a Date</h4>
            <p className="text-sm text-gray-600 mb-4">Vote for the best day</p>
            <div className="space-y-3">
              {dateOptions.map(date => (
                <button
                  key={date.id}
                  onClick={() => voteForDate(date.id)}
                  className="w-full p-4 rounded-2xl flex items-center justify-between"
                  style={{ backgroundColor: colors.background, border: `2px solid ${colors.primary}` }}
                >
                  <div className="flex items-center gap-3">
                    <Calendar size={20} color={colors.primary} />
                    <span className="font-medium" style={{ color: colors.deepBlue }}>{date.display}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p>Say hello to your new Cirqle!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => {
              const isOwnMessage = msg.userId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{msg.user}</span>
                  <div 
                    className="p-3 rounded-3xl max-w-xs" 
                    style={{ 
                      backgroundColor: isOwnMessage ? colors.primary : colors.white,
                      color: isOwnMessage ? colors.white : colors.deepBlue
                    }}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-white opacity-75' : 'text-gray-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="p-4" style={{ backgroundColor: colors.white }}>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={messageInput} 
            onChange={(e) => setMessageInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
            placeholder="Type a message..." 
            className="flex-1 px-4 py-3 rounded-full border-2" 
            style={{ borderColor: colors.primary + '50' }} 
          />
          <button 
            onClick={sendMessage} 
            className="w-12 h-12 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: colors.primary }}
          >
            <Send size={20} color={colors.white} />
          </button>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );

  if (screen === 'home') return (
    <div className="min-h-screen pb-20 px-6 py-8" style={{ backgroundColor: colors.background }}>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold" style={{ color: colors.deepBlue }}>Welcome, {userData.name}!</h1>
        <button onClick={handleSignOut} className="p-2 rounded-full" style={{ backgroundColor: colors.white }}>
          <LogOut size={20} color={colors.primary} />
        </button>
      </div>
      <p className="text-gray-600 mb-8">Your Cirqle</p>
      
      {currentCircle ? (
        <div onClick={() => setScreen('chat')} className="p-6 rounded-3xl cursor-pointer" style={{ backgroundColor: colors.white }}>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold" style={{ color: colors.deepBlue }}>Your Active Cirqle</h3>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary, color: colors.white }}>
              {currentCircle.members.length}/2
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{currentCircle.city}</p>
          <div className="flex flex-wrap gap-2">
            {currentCircle.top_interests?.map(i => (
              <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.background, color: colors.primary }}>
                {i}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl text-center" style={{ backgroundColor: colors.white }}>
          <p className="text-gray-600 mb-4">You're not in a Cirqle yet</p>
          <button onClick={() => setScreen('interests')} className="px-6 py-3 rounded-full" style={{ backgroundColor: colors.primary, color: colors.white }}>
            Find a Cirqle
          </button>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );

  if (screen === 'profile') return (
    <div className="min-h-screen pb-20 px-6 py-8" style={{ backgroundColor: colors.background }}>
      <h1 className="text-3xl font-bold mb-8" style={{ color: colors.deepBlue }}>Profile</h1>

      <div className="mb-8 text-center">
        {userData.photo && (
          <img src={userData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg border-4" style={{ borderColor: colors.primary }} />
        )}
        <h2 className="text-2xl font-bold" style={{ color: colors.deepBlue }}>{userData.name}</h2>
        <p className="text-gray-600">{userData.age} years • {userData.city}</p>
        <p className="text-sm text-gray-500 mt-1">{session?.user?.email}</p>
      </div>

      <div className="p-6 rounded-3xl mb-4" style={{ backgroundColor: colors.white }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.deepBlue }}>My Interests</h3>
        <div className="flex flex-wrap gap-2">
          {userData.interests.map(interest => (
            <span key={interest} className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.background, color: colors.primary }}>
              {interest}
            </span>
          ))}
        </div>
      </div>

      <button onClick={handleSignOut} className="w-full py-3 rounded-full font-semibold border-2" style={{ borderColor: '#DC2626', color: '#DC2626' }}>
        Logout
      </button>
      
      <BottomNavigation />
    </div>
  );

  if (screen === 'members') return (
    <div className="min-h-screen pb-20 px-6 py-8" style={{ backgroundColor: colors.background }}>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen('chat')}>
          <ArrowLeft size={24} color={colors.primary} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: colors.deepBlue }}>Members</h1>
      </div>

      <div className="space-y-4">
        {currentCircle?.members.map(member => (
          <div key={member.id} className="p-6 rounded-3xl" style={{ backgroundColor: colors.white }}>
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: colors.background, border: `2px solid ${colors.primary}` }}
              >
                {member.photo || '👤'}
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: colors.deepBlue }}>{member.name}</h3>
                <p className="text-gray-600">{member.age} years old</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: colors.deepBlue }}>Interests</p>
              <div className="flex flex-wrap gap-2">
                {member.interests?.map(interest => (
                  <span key={interest} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: colors.background, color: colors.primary }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavigation />
    </div>
  );

  return (
    <div className="font-sans">
      <MatchingNotification />
      <WinnerModal />
      <MatchAnimationModal />
      <EventConfirmationModal />
      <MatchRevealModal />
    </div>
  );
}

export default App;
