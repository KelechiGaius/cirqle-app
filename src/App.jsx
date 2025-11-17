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
          setMessages(prev => [...prev, {
            id: newMessage.id,
            user: newMessage.sender_name || 'Unknown',
            text: newMessage.text,
            userId: newMessage.user_id,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    messagesSubscription.current = channel;

    return () => {
      console.log('Cleaning up messages subscription');
      if (messagesSubscription.current) {
        supabase.removeChannel(messagesSubscription.current);
      }
    };
  }, [currentCircle]);

  const loadMessages = async () => {
    if (!currentCircle) return;

    console.log('📨 Loading messages for circle:', currentCircle.id);
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('circle_id', currentCircle.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Error loading messages:', error);
      return;
    }

    if (data) {
      console.log('✅ Messages loaded:', data.length);
      setMessages(data.map(m => ({
        id: m.id,
        user: m.sender_name || 'Unknown',
        text: m.text,
        userId: m.user_id,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    }
  };

  const handleSignUp = async () => {
    try {
      setAuthError('');
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password,
      });

      if (error) throw error;

      if (data.session) {
        setSession(data.session);
        console.log('✅ Session set after registration:', data.session.user.id);
      }

      setAuthData({ email: '', password: '' });
      setScreen('onboarding');
      console.log('✅ Registered successfully, redirecting to onboarding');
    } catch (error) {
      setAuthError(error.message);
      console.error('❌ Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthError('');
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password,
      });

      if (error) throw error;
      setAuthData({ email: '', password: '' });
      console.log('✅ Login successful');
    } catch (error) {
      setAuthError(error.message);
      console.error('❌ Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setCurrentUser(null);
    setCurrentCircle(null);
    setUserData({ name: '', age: '', photo: null, city: '', interests: [] });
    setScreen('welcome');
  };

  const calculateInterestOverlap = (interests1, interests2) => {
    const common = interests1.filter(i => interests2.includes(i));
    return common.length;
  };

  const findAndCreateCircle = async () => {
    if (!session) {
      console.error('❌ No session found!');
      alert('Please login first. Session expired.');
      setScreen('auth');
      return;
    }

    if (!session.user || !session.user.id) {
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
      
      setTimeout(() => {
        if (!showWinnerModal) {
          console.error('⚠️ EMERGENCY: Winner modal did not appear! Forcing it now...');
          if (votingActivities.length > 0) {
            const emergencyWinner = votingActivities[Math.floor(Math.random() * votingActivities.length)];
            setWinningActivity({ ...emergencyWinner, score: '4.0' });
            setShowWinnerModal(true);
          }
        }
      }, 5000);
    }
  };

  const finishVoting = async (finalUserVotes) => {
    try {
      console.log('🔥 Starting finishVoting...');
      
      setCurrentVotingIndex(votingActivities.length);
      
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
      setWinningActivity(winnerWithScore);
      console.log('✅ Winner set:', winnerWithScore.title);
      
      setTimeout(() => {
        console.log('🏆 Showing winner modal...');
        setShowWinnerModal(true);
      }, 1000);

      if (currentCircle && currentUser) {
        try {
          const votesToSave = Object.entries(finalUserVotes).map(([activityId, rating]) => ({
            circle_id: currentCircle.id,
            user_id: currentUser.id,
            activity_id: activityId,
            rating: rating
          }));

          await supabase.from('votes').insert(votesToSave);
          console.log('✅ Votes saved');
        } catch (err) {
          console.warn('⚠️ Votes save failed:', err);
        }
      }
      
      if (currentCircle && winner) {
        try {
          await supabase
            .from('circles')
            .update({ 
              winning_activity: winner.id,
              winning_activity_data: winner 
            })
            .eq('id', currentCircle.id);
          console.log('✅ Winner saved');
        } catch (err) {
          console.warn('⚠️ Winner save failed:', err);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in finishVoting:', error);
      if (votingActivities.length > 0) {
        const fallbackWinner = votingActivities[0];
        setWinningActivity({ ...fallbackWinner, score: '4.0' });
        setTimeout(() => setShowWinnerModal(true), 1000);
      }
    }
  };

  const startDatePoll = () => {
    console.log('Starting date poll...');
    const dates = generateDateOptions();
    setDateOptions(dates);
    setShowWinnerModal(false);
    
    setTimeout(() => {
      setShowMatchAnimation(true);
      console.log('✅ Showing match animation');
      
      setTimeout(() => {
        setShowMatchAnimation(false);
        setShowDatePoll(true);
        setScreen('chat');
        console.log('✅ Navigated to chat with date poll');
      }, 3000);
    }, 300);
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
      
      setDateVotes(allVotes);
      
      const winnerDate = dateOptions.find(d => d.id === dateId);
      setSelectedDate(winnerDate);
      setShowDatePoll(false);
      setShowEventConfirmation(true);

      if (currentCircle && winningActivity) {
        await supabase
          .from('circles')
          .update({ 
            event_date: winnerDate.date.toISOString(),
            event_confirmed: true
          })
          .eq('id', currentCircle.id);
        console.log('✅ Event saved');
      }
      
      setTimeout(() => {
        setShowEventConfirmation(false);
        setScreen('chat');
        console.log('✅ Redirected to chat');
      }, 3000);
    } catch (error) {
      console.error('❌ Error voting for date:', error);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep === 0 && !userData.name) {
      alert('Please enter your name');
      return;
    }
    if (onboardingStep === 1 && !userData.age) {
      alert('Please enter your age');
      return;
    }
    if (onboardingStep === 2 && !userData.photo) {
      alert('Please add a photo');
      return;
    }
    if (onboardingStep === 3 && !userData.city) {
      alert('Please enter your city');
      return;
    }
    
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setScreen('interests');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData({ ...userData, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const toggleInterest = (interest) => {
    const current = userData.interests;
    if (current.includes(interest)) {
      setUserData({ ...userData, interests: current.filter(i => i !== interest) });
    } else {
      setUserData({ ...userData, interests: [...current, interest] });
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) {
      console.log('❌ Empty message');
      return;
    }
    
    if (!currentCircle) {
      console.log('❌ No circle');
      alert('Not in a circle');
      return;
    }
    
    if (!currentUser) {
      console.log('❌ No user');
      alert('Not logged in');
      return;
    }

    console.log('📤 Sending message:', messageInput);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          circle_id: currentCircle.id,
          user_id: currentUser.id,
          sender_name: currentUser.name,
          text: messageInput
        }])
        .select();

      if (error) throw error;
      
      console.log('✅ Message sent successfully:', data);
      setMessageInput('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      alert('Error sending message: ' + error.message);
    }
  };

  const CircleLogo = ({ size = 80, color = colors.primary }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="35" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray="200, 30" transform="rotate(-10 50 50)" />
    </svg>
  );

  const BottomNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 px-6 py-4 shadow-lg flex justify-around items-center" style={{ backgroundColor: colors.white, borderTop: `1px solid ${colors.background}` }}>
      <button onClick={() => { setBottomNav('home'); setScreen('home'); }} className="flex flex-col items-center gap-1" style={{ color: bottomNav === 'home' ? colors.primary : '#9CA3AF' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span className="text-xs font-medium">Home</span>
      </button>
      
      <button onClick={() => { setBottomNav('circle'); currentCircle && setScreen('chat'); }} className="flex flex-col items-center gap-1" style={{ color: bottomNav === 'circle' ? colors.primary : '#9CA3AF' }}>
        <CircleLogo size={28} color={bottomNav === 'circle' ? colors.primary : '#9CA3AF'} />
        <span className="text-xs font-medium">Circle</span>
      </button>
      
      <button onClick={() => { setBottomNav('profile'); setScreen('profile'); }} className="flex flex-col items-center gap-1" style={{ color: bottomNav === 'profile' ? colors.primary : '#9CA3AF' }}>
        <User size={24} />
        <span className="text-xs font-medium">Profile</span>
      </button>
    </div>
  );

  const MatchingNotification = () => {
    if (!showMatchingNotification) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary + '20' }}>
            <Check size={40} color={colors.primary} />
          </div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>You're in! 🎉</h3>
          <p className="text-gray-600 mb-4">Matched with {currentCircle?.members.length} people</p>
          <div className="flex justify-center gap-2 flex-wrap mb-4">
            {currentCircle?.members.slice(0, 2).map((m, i) => (
              <div key={i} className="text-3xl">{m.photo}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const MatchAnimationModal = () => {
    if (!showMatchAnimation || !currentCircle) return null;
    
    const otherMembers = currentCircle.members.filter(m => m.id !== currentUser?.id);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center animate-bounce-once">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: colors.deepBlue }}>You matched with!</h3>
          
          <div className="flex justify-center gap-4 mb-6">
            {otherMembers.map((member, i) => (
              <div key={i} className="text-center">
                {member.photo && typeof member.photo === 'string' && member.photo.startsWith('data:') ? (
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-4"
                    style={{ borderColor: colors.primary }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-2 border-4" 
                    style={{ borderColor: colors.primary, backgroundColor: colors.background }}>
                    {member.photo || '👤'}
                  </div>
                )}
                <p className="font-bold" style={{ color: colors.primary }}>{member.name}</p>
                <p className="text-sm text-gray-600">{member.age} years</p>
              </div>
            ))}
          </div>
          
          <p className="text-gray-600">Let's pick a date for your activity!</p>
        </div>
      </div>
    );
  };

  const MembersModal = ({ isOpen, onClose }) => {
    if (!isOpen || !currentCircle) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold" style={{ color: colors.deepBlue }}>Circle Members</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X size={24} color={colors.deepBlue} />
            </button>
          </div>
          
          <div className="space-y-4">
            {currentCircle.members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: colors.background }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2" 
                  style={{ borderColor: colors.primary, backgroundColor: colors.white }}>
                  {member.photo || '👤'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg" style={{ color: colors.deepBlue }}>{member.name}</p>
                  <p className="text-sm text-gray-600">{member.age} years • {currentCircle.city}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-full font-semibold"
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const WinnerModal = () => {
    console.log('WinnerModal render - showWinnerModal:', showWinnerModal, 'winningActivity:', winningActivity);
    
    if (!showWinnerModal || !winningActivity) {
      console.log('WinnerModal not showing');
      return null;
    }
    
    console.log('✅ WinnerModal IS SHOWING with activity:', winningActivity.title);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>Winner!</h3>
          <p className="text-gray-600 mb-6">Your Cirqle has chosen</p>
          
          <div className="text-5xl mb-4">{winningActivity.emoji}</div>
          <h4 className="text-xl font-semibold mb-2" style={{ color: colors.primary }}>{winningActivity.title}</h4>
          <p className="text-gray-600 mb-4">{winningActivity.description}</p>
          
          <button 
            onClick={() => {
              console.log('🔥 "Pick a Date" clicked!');
              startDatePoll();
            }} 
            className="w-full py-3 rounded-full font-semibold" 
            style={{ backgroundColor: colors.primary, color: colors.white }}
          >
            Pick a Date
          </button>
        </div>
      </div>
    );
  };

  const EventConfirmationModal = () => {
    if (!showEventConfirmation || !selectedDate || !winningActivity) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>It's official!</h3>
          <p className="text-gray-600 mb-6">Your meeting is scheduled</p>
          
          <div className="p-5 rounded-2xl mb-6" style={{ backgroundColor: colors.primary }}>
            <div className="text-4xl mb-3">{winningActivity.emoji}</div>
            <h4 className="text-lg font-bold text-white mb-2">{winningActivity.title}</h4>
            <p className="text-white opacity-90 mb-3">{winningActivity.location}</p>
            <div className="flex items-center justify-center gap-2 text-white">
              <Calendar size={18} />
              <span className="font-semibold">{selectedDate.display} at {winningActivity.time}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.white }}>
        <div className="text-center">
          <CircleLogo size={80} />
          <p className="mt-4" style={{ color: colors.primary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (screen === 'welcome') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.white }}>
      <CircleLogo size={100} />
      <h1 className="text-5xl font-bold mt-6 mb-3" style={{ color: colors.primary, letterSpacing: '0.1em' }}>CIRQLE</h1>
      <p className="text-xl mb-12" style={{ color: colors.deepBlue }}>Make real friends in small groups</p>
      <button onClick={() => setScreen('auth')} className="px-10 py-4 rounded-full text-lg font-semibold shadow-lg" style={{ backgroundColor: colors.primary, color: colors.white }}>
        Get Started
      </button>
    </div>
  );

  if (screen === 'auth') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.white }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <CircleLogo size={80} />
          <h1 className="text-4xl font-bold mt-4 mb-2" style={{ color: colors.primary, letterSpacing: '0.1em' }}>CIRQLE</h1>
          <p style={{ color: colors.deepBlue }}>Meet people, not profiles</p>
        </div>

        <div className="p-6 rounded-3xl shadow-lg" style={{ backgroundColor: colors.white }}>
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setAuthMode('login'); setAuthError(''); }} className="flex-1 py-2 rounded-lg font-semibold transition-colors" style={{ backgroundColor: authMode === 'login' ? colors.primary : colors.white, color: authMode === 'login' ? colors.white : colors.primary, border: `2px solid ${colors.primary}` }}>
              Login
            </button>
            <button onClick={() => { setAuthMode('register'); setAuthError(''); }} className="flex-1 py-2 rounded-lg font-semibold transition-colors" style={{ backgroundColor: authMode === 'register' ? colors.primary : colors.white, color: authMode === 'register' ? colors.white : colors.primary, border: `2px solid ${colors.primary}` }}>
              Register
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2" style={{ borderColor: colors.primary + '50' }}>
              <Mail size={20} color={colors.primary} />
              <input type="email" value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} placeholder="Email" className="flex-1 outline-none bg-transparent" onKeyPress={(e) => e.key === 'Enter' && (authMode === 'login' ? handleSignIn() : handleSignUp())} />
            </div>

            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-2" style={{ borderColor: colors.primary + '50' }}>
              <Lock size={20} color={colors.primary} />
              <input type="password" value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} placeholder="Password" className="flex-1 outline-none bg-transparent" onKeyPress={(e) => e.key === 'Enter' && (authMode === 'login' ? handleSignIn() : handleSignUp())} />
            </div>

            {authError && (
              <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {authError}
              </div>
            )}

            <button onClick={authMode === 'login' ? handleSignIn : handleSignUp} disabled={loading} className="w-full py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50" style={{ backgroundColor: colors.primary, color: colors.white }}>
              {loading ? 'Loading...' : authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </div>
        </div>

        <button onClick={() => setScreen('welcome')} className="mt-4 w-full py-2 text-center" style={{ color: colors.primary }}>
          ← Back
        </button>
      </div>
    </div>
  );

  if (screen === 'onboarding') {
    const steps = [
      { label: 'What\'s your name?', field: 'name', type: 'text', placeholder: 'Enter your name' },
      { label: 'How old are you?', field: 'age', type: 'number', placeholder: 'Enter your age' },
      { label: 'Add a photo', field: 'photo', type: 'file' },
      { label: 'Which city are you in?', field: 'city', type: 'text', placeholder: 'Enter your city' }
    ];
    const step = steps[onboardingStep];

    return (
      <div className="min-h-screen px-6 py-12" style={{ backgroundColor: colors.white }}>
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 mb-6">
            {steps.map((_, idx) => (
              <div key={idx} className="h-2 flex-1 rounded-full" style={{ backgroundColor: idx <= onboardingStep ? colors.primary : '#E5E7EB' }} />
            ))}
          </div>
          <h2 className="text-3xl font-bold mb-6" style={{ color: colors.deepBlue }}>{step.label}</h2>
          
          {step.type === 'file' ? (
            <div className="mb-8">
              {userData.photo ? (
                <div className="text-center">
                  <img src={userData.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg border-4" style={{ borderColor: colors.primary }} />
                  <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.primary, color: colors.white }}>
                    Change Photo
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed rounded-3xl cursor-pointer" style={{ borderColor: colors.primary }}>
                  <Camera size={48} color={colors.primary} />
                  <span className="mt-2" style={{ color: colors.primary }}>Tap to upload photo</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>
          ) : (
            <input type={step.type} value={userData[step.field]} onChange={(e) => setUserData({ ...userData, [step.field]: e.target.value })} placeholder={step.placeholder} className="w-full px-6 py-4 rounded-full text-lg border-2 mb-6" style={{ borderColor: colors.primary + '50' }} />
          )}
          
          <button onClick={handleOnboardingNext} disabled={!userData[step.field]} className="w-full py-4 rounded-full text-lg font-semibold disabled:opacity-50" style={{ backgroundColor: colors.primary, color: colors.white }}>Continue</button>
        </div>
      </div>
    );
  }

  if (screen === 'interests') return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: colors.white }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CircleLogo size={60} />
          <h1 className="text-2xl font-bold mt-4" style={{ color: colors.primary, letterSpacing: '0.1em' }}>CIRQLE</h1>
          <p className="text-sm mt-2" style={{ color: colors.deepBlue }}>Make real friends in small groups</p>
        </div>
        
        {!session && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            ⚠️ Warning: No active session detected.
          </div>
        )}
        
        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.deepBlue }}>Pick your interests</h2>
        <p className="text-gray-600 mb-8">Select at least 3 things you enjoy</p>

        <div className="flex flex-wrap gap-3 mb-8">
          {INTERESTS.map(i => {
            const selected = userData.interests.includes(i);
            return (
              <button key={i} onClick={() => toggleInterest(i)} className="px-6 py-3 rounded-full font-medium" style={{ backgroundColor: selected ? colors.primary : colors.white, color: selected ? colors.white : colors.primary, border: `2px solid ${colors.primary}` }}>
                {i}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-4">
          <span className="font-medium" style={{ color: colors.primary }}>{userData.interests.length} selected</span>
        </div>

        <button onClick={findAndCreateCircle} disabled={userData.interests.length < 3 || loading} className="w-full py-4 rounded-full text-lg font-semibold disabled:opacity-50" style={{ backgroundColor: colors.primary, color: colors.white }}>
          {loading ? 'Finding your Cirqle...' : 'Join Cirqle'}
        </button>
      </div>
    </div>
  );

  if (screen === 'voting') {
    if (currentVotingIndex >= votingActivities.length) {
      return (
        <>
          <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
            <div className="text-center">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-xl font-semibold" style={{ color: colors.deepBlue }}>Calculating results...</p>
            </div>
          </div>
          <WinnerModal />
        </>
      );
    }
    
    const activity = votingActivities[currentVotingIndex];
    
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
        <div className="px-6 py-4 shadow-sm" style={{ backgroundColor: colors.white }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold" style={{ color: colors.deepBlue }}>Rate Activities</h3>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary, color: colors.white }}>
              {currentVotingIndex + 1}/{votingActivities.length}
            </span>
          </div>
          <p className="text-sm text-gray-600">Your Cirqle will do the highest-rated activity</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
              <div className="h-48 flex items-center justify-center text-7xl" style={{ backgroundColor: colors.background }}>
                {activity.emoji}
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: colors.deepBlue }}>{activity.title}</h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold" style={{ color: colors.primary }}>{activity.price}</span>
                  <span className="text-sm text-gray-500">For your group of {currentCircle?.members.length || 2}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-center font-semibold mb-4" style={{ color: colors.deepBlue }}>How much do you want to do this?</p>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4].map(rating => (
                  <button
                    key={rating}
                    onClick={() => voteForActivity(activity.id, rating)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105"
                    style={{ backgroundColor: colors.white, border: `2px solid ${colors.primary}` }}
                  >
                    <div className="flex gap-1">
                      {[...Array(rating)].map((_, i) => (
                        <Star key={i} size={20} fill={colors.primary} color={colors.primary} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.primary }}>{rating}</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">Rate from 1 to 4</p>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'chat') return (
    <div className="h-screen flex flex-col pb-20" style={{ backgroundColor: colors.background }}>
      <div className="px-6 py-4 shadow-sm" style={{ backgroundColor: colors.white }}>
        <h3 className="font-semibold" style={{ color: colors.deepBlue }}>Your Cirqle</h3>
        <p className="text-sm text-gray-600">{currentCircle?.members.length || 0} members</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* 🔥 MEMBERS ANGEZEIGT DIREKT IM CHAT! */}
        <div className="mb-6 p-5 rounded-3xl" style={{ backgroundColor: colors.white }}>
          <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.deepBlue }}>
            <Users size={20} color={colors.primary} />
            Circle Members
          </h4>
          <div className="space-y-3">
            {currentCircle?.members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: colors.background }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2" 
                  style={{ borderColor: colors.primary, backgroundColor: colors.white }}>
                  {member.photo || '👤'}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ color: colors.deepBlue }}>{member.name}</p>
                  <p className="text-xs text-gray-600">{member.age} years • {currentCircle.city}</p>
                </div>
                {member.id === currentUser?.id && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.primary, color: colors.white }}>You</span>
                )}
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

  return (
    <div className="font-sans">
      <MatchingNotification />
      <WinnerModal />
      <MatchAnimationModal />
      <EventConfirmationModal />
    </div>
  );
}

export default App;

