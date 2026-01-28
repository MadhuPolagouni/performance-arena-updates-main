import { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import { motion, AnimatePresence } from 'framer-motion';
import Dialog from '@mui/material/Dialog';
import guidesData from '../data/guides.json';
import useAuthStore from '../store/authStore';
import '../App.css';
import { Scene3D } from '../components/Scene3D';
import { Decorations3D } from '../components/Decorations3D';
import { FloatingBalloons } from '../components/FloatingBalloons';
import { gsap } from 'gsap';

// Define prizes directly in the component to avoid JSON loading issues
const PRIZES = {
  diamond: ["Cheers", "Shopping voucher", "Headset","Better luck next time"],
  gold: ["Coffee mug ", "WFH perks ","Better luck next time"],
  silver: [ "WFH perks","Better luck next time"],
  bronze: [ "GoDaddy T-shirt", "Sipper","Better luck next time"]
};

const ALL_PRIZES = [
  '🎉 \n Cheers',
  '🎧 \n Premium Headset',
  '☕ \n Coffee mug',
  '🏠 \n WFH Perks',
  '👕 \n GD T-Shirt',
  '🍶 \n Sipper',
  "🍀 \n Better \n luck next\n time", 
  "🎟️ \n Shopping voucher",
];

function SpinningWheel() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [currentPrizes, setCurrentPrizes] = useState([]);
  const [bucketPrizes, setBucketPrizes] = useState([]);
  const [showWheel, setShowWheel] = useState(false);
  const [winningPrize, setWinningPrize] = useState('');
  const [currentGuide, setCurrentGuide] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [isPlaceholderSpinning, setIsPlaceholderSpinning] = useState(true);
  const { user, addReward } = useAuthStore();
  const textRef = useRef(null);

  const wheelColors = ['#ffdf0e', '#9b59fb', '#eb7beb', '#b1ee31', '#2afcd5', '#20d087', '#3674B5'];
  const wheelData = currentPrizes.map((prize, index) => ({
    option: prize.replace(/\\n/g, '\n'),  // Ensure line breaks are interpreted
    style: {
      backgroundColor: wheelColors[index % wheelColors.length],
      textColor: '#FFFFFF',
      fontWeight: 'bold',
      textOrientation: 'horizontal', // Change from 'vertical' to 'horizontal'
      textPosition: 'outer',
      whiteSpace: 'pre-line', // Ensure line breaks work
    }
  }));
  

  useEffect(() => {
    // Initialize the wheel based on the logged-in user
    if (user) {
      const userName = user.username.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      const guide = guidesData.guides.find(g => 
        g['name'].toLowerCase() === userName.toLowerCase()
      );
      
      if (guide) {
        setCurrentGuide(guide);
      }
    }
  }, [user]);

  useEffect(() => {
    let confettiInterval;
    if (isPlaceholderSpinning) {
      confettiInterval = setInterval(() => {
        createConfetti(50); // Reduced number of confetti particles
      }, 8000); // Increased interval
    }
    return () => clearInterval(confettiInterval);
  }, [isPlaceholderSpinning]);

  const sendPrizeEmail = async (guide, prize) => {
    const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">🎉 Congratulations on Your Prize! 🎉</h2>
            
            <p>Dear ${guide.name},</p>
            
            <p>We're excited to inform you that you've won a fantastic prize in our GoDaddy Wheel of Fortune game!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #e74c3c; text-align: center;">Your Prize: ${prize}</h3>
            </div>
            
            <p>Prize Details:</p>
            <ul>
              <li>Prize Category: ${guide.bucket.toUpperCase()}</li>
              <li>Guide ID: ${guide.id}</li>
              <li>Date Won: ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>To claim your prize, please contact the HR department with your Guide ID.</p>
            
            <p>Best regards,<br>GoDaddy Team</p>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: guide.email,
          cc: guide.cc,
          subject: '🎉 Congratulations on Your Prize!',
          html: emailTemplate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Email sent successfully');
        console.log('Email preview URL:', data.previewUrl);
      } else {
        console.error('Failed to send email:', data.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSpinClick = () => {
    if (!showWheel) {
      initializeWheel();
      return;
    }

    if (!mustSpin && selectedPrize !== null) {
      setPrizeNumber(selectedPrize);
      setMustSpin(true);
    }
  };

  const initializeWheel = () => {
    if (currentGuide) {
      const bucket = currentGuide.bucket;
      const userBucketPrizes = PRIZES[bucket] || PRIZES.bronze;
      
      const winningPrizeIndex = Math.floor(Math.random() * userBucketPrizes.length);
      console.log(`Winning prize index: ${winningPrizeIndex}`);
      const selectedPrize = userBucketPrizes[winningPrizeIndex];
      
      setCurrentPrizes(ALL_PRIZES.map(prize => {
        const words = prize.split(' ');  
        if (words.length > 1) {
          return words.slice(0, Math.ceil(words.length / 2)).join(' ') + '\n' + words.slice(Math.ceil(words.length / 2)).join(' ');
        }
        return prize;
      }));
      
      setBucketPrizes(userBucketPrizes);
      setShowWheel(true);
      
      const prizeIndexInWheel = ALL_PRIZES.findIndex(prize => prize === selectedPrize);
      setSelectedPrize(prizeIndexInWheel >= 0 ? prizeIndexInWheel : 0);
      setWinningPrize(selectedPrize);
      
      console.log(`Selected prize bucket: ${bucket}`);
      createConfetti(100);
    }
  };

  const PlaceholderWheel = () => {
    useEffect(() => {
      const spinInterval = setInterval(() => {
        setIsPlaceholderSpinning(prev => !prev);
        if (isPlaceholderSpinning) {
          createConfetti(30); // Reduced number of confetti particles
        }
      }, 4000); // Increased interval
      return () => clearInterval(spinInterval);
    }, []);

    return (
      <motion.div 
        className="wheel-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        <div className="placeholder-wheel-outer">
          <div className="placeholder-wheel">
            <motion.div 
              className="wheel-center-animation"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            ></motion.div>
            <div className="placeholder-segments">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="segment"
                  style={{ transform: `rotate(${i * 60}deg)` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const updateGuideRewards = (guide, prize) => {
    // Update the guide's rewards in the store
    addReward(prize);
    
    // Deduct points for spinning (500 points per spin)
    const updatedPoints = Math.max(0, parseInt(guide.Points) - 500);
    guide.Points = updatedPoints.toString();
    
    // Add the prize to the guide's rewards
    if (guide.rewards) {
      guide.rewards += `, ${prize}`;
    } else {
      guide.rewards = prize;
    }
    
    console.log(`Updated rewards for ${guide.name} (${guide.ID}): ${prize}`);
    console.log(`Updated points for ${guide.name} (${guide.ID}): ${guide.Points}`);
  };

  const handleClaimPrize = () => {
    if (currentGuide && winningPrize) {
      sendPrizeEmail(currentGuide, winningPrize);
      updateGuideRewards(currentGuide, winningPrize);
      console.log(`Prize claimed by ${currentGuide.name} (${currentGuide.ID}): ${winningPrize}`);
    }
    
    setShowWinDialog(false);
    setMustSpin(false);
    setPrizeNumber(0);
    setBucketPrizes([]);
    setCurrentPrizes([]);
    setWinningPrize('');
    setShowWheel(false);
    setSelectedPrize(null);
    setIsPlaceholderSpinning(true);
    setTimeout(() => createConfetti(50), 500);
  };

  const handleSpinStop = () => {
    setMustSpin(false);
    createConfetti(150);
    console.log(`Wheel stopped - Prize won: ${winningPrize}`);
    setTimeout(() => {
      setShowWinDialog(true);
    }, 1000);
  };

  const createConfetti = (count = 150) => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    const colors = [
      '#FFD700',
      '#E82561',
      '#4A90E2',
      '#50E3C2',
      '#F5A623',
      '#D0021B',
      '#7ED321',
    ];
    
    const shapes = ['star', 'circle', 'triangle', 'diamond'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      confetti.className = `confetti ${shape}`;
      
      const angle = (Math.random() * 360) * (Math.PI / 180);
      const velocity = 100 + Math.random() * 200;
      
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      confetti.style.setProperty('--tx', `${tx}px`);
      confetti.style.setProperty('--ty', `${ty}px`);
      
      const animationDuration = 1 + Math.random() * 2;
      const animationDelay = Math.random() * 0.5;
      
      confetti.style.animation = `confetti-burst ${animationDuration}s ease-out forwards`;
      confetti.style.animationDelay = `${animationDelay}s`;
      
      const size = 8 + Math.random() * 12;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.8)';
      
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 4000);
  };
  
  return (
    <motion.div 
      className="app-container bg-gradient-to-r from-[#1a237e] via-[#4a148c] to-[#880e4f] pb-40 px-0 sm:px-6 lg:px-4 no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      
      <FloatingBalloons side="left" />
      <FloatingBalloons side="right" />
      
      <motion.div 
        className="wheel-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Scene3D />

        {/* Wheel pointer at the top */}
        {/* <div className="wheel-pointer">
          <div className="wheel-pointer-triangle"></div>
          <div className="wheel-pointer-circle"></div>
        </div> */}

        <div className="trophy-icon">🏆</div>
        <motion.div 
          className="logo-container"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div 
            className="logo-left-logo"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              className="img-sizing" 
              src="data:image/jpeg;base64,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" 
              alt="Left Logo" 
            />
          </motion.div>
          <motion.h1 
            className="lucky-spin-text "
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Whirl of Wins
          </motion.h1>
          <motion.div 
            className="logo-right-logo"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              className="img-sizing"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaqVGwXfboLlsa3uQAI8Yim-rx9MrsRYED-w&s"
              alt="Right Logo"
            />
          </motion.div>
        </motion.div>
        
        <div className="wheel-container">
          <div className="wheel-outer">
            <div className="wheel-ring-outer"></div>
            <div className="wheel-ring-middle"></div>
            <div className="wheel-ring-inner"></div>
            {!showWheel ? (
              <PlaceholderWheel />
            ) : currentPrizes.length > 0 ? (
              <motion.div 
                className="wheel-content"
                initial={{ rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {wheelData.length > 0 && (
                  <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={wheelData}
                    onStopSpinning={handleSpinStop}
                    outerBorderColor="rgba(255, 255, 255, 0.8)"
                    outerBorderWidth={4}
                    innerRadius={20}
                    radiusLineColor="rgba(255, 255, 255, 0.5)"
                    radiusLineWidth={2}
                    textDistance={85}
                    fontSize={16}
                    spinDuration={1} // Increased spin duration to 10 seconds
                    perpendicularText={true}
                  />
                )}
                <motion.div 
                  className="wheel-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                ></motion.div>
              </motion.div>
            ) : (
              <motion.div 
                className="mega-win"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Wheel <br/> OF <br/> Fortune
              </motion.div>
            )}
          </div>
        </div>

        <motion.button 
          className="spin-button" 
          onClick={handleSpinClick}
          disabled={mustSpin}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showWheel ? '500 🎟️' : 'SPIN'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        <Dialog 
          open={showWinDialog}
          onClose={() => setShowWinDialog(false)}
          PaperProps={{
            className: 'custom-dialog'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="dialog-title">Congratulations! 🎉</div>
            <div style={{ textAlign: 'center' }}>
              <motion.h2 
                style={{ color: '#fff', marginBottom: '1rem' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                You've Won:
              </motion.h2>
              <motion.h1 
                style={{ color: '#FFD700', fontSize: '2rem', marginBottom: '2rem' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {winningPrize}
              </motion.h1>
              <motion.button 
                className="dialog-button"
                onClick={handleClaimPrize}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Claim Prize
              </motion.button>
            </div>
          </motion.div>
        </Dialog>
      </AnimatePresence>
    </motion.div>
  );
}

export default SpinningWheel;