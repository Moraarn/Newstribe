"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Settings,
  Volume2,
  VolumeX,
  Music,
  ImageIcon,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IQuestion, IQuiz } from "@/types/quiz";
import { IContent } from "@/types/content";
import { useUser } from "@/contexts/user-context";
import { useNotifications } from "@/contexts/notification-context";
import { PointsEarnedDialog } from "@/components/points-earned-dialog";
import { PointsSource } from "@/types/points";
import { NotificationType } from "@/types/notification";
import { awardPoints } from "@/app/(app)/content/actions";

// Calculate points per question

// Replace the backgroundOptions array with this new version that uses real images
const backgroundOptions = [
  {
    id: "savanna",
    name: "Savanna Sunset",
    class: "bg-gradient-to-b from-amber-800/85 to-yellow-800/85",
    image:
      "https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "forest",
    name: "Rainforest",
    class: "bg-gradient-to-b from-emerald-900/85 to-green-900/85",
    image:
      "https://images.pexels.com/photos/38136/pexels-photo-38136.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "mountain",
    name: "Mount Kenya",
    class: "bg-gradient-to-b from-slate-800/85 to-indigo-900/85",
    image:
      "https://images.pexels.com/photos/371633/pexels-photo-371633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "coast",
    name: "Coastal Beach",
    class: "bg-gradient-to-b from-cyan-800/85 to-blue-900/85",
    image:
      "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
  {
    id: "night",
    name: "Starry Night",
    class: "bg-gradient-to-b from-gray-900/85 to-purple-900/85",
    image:
      "https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  },
];

// Replace the avatarOptions array with this new version that uses seed-based avatars
const avatarOptions = [
  {
    id: "explorer",
    name: "Explorer",
    seed: "explorer123",
  },
  {
    id: "historian",
    name: "Historian",
    seed: "historian456",
  },
  {
    id: "professor",
    name: "Professor",
    seed: "professor789",
  },
  {
    id: "student",
    name: "Student",
    seed: "student101",
  },
  {
    id: "adventurer",
    name: "Adventurer",
    seed: "adventurer202",
  },
  {
    id: "researcher",
    name: "Researcher",
    seed: "researcher303",
  },
];

// Add this helper function to generate avatar URLs
const getAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=ffad08,f5bb00,ec9f05,d76a03,bf3100&backgroundType=gradientLinear`;
};

export default function QuizGame({ quizData }: { quizData: IContent }) {
  const pointsPerQuestion = quizData?.points / (quizData?.quiz?.questions?.length || 1) || 0;

  // Game state
  const [gameState, setGameState] = useState<"setup" | "intro" | "playing" | "results">("setup");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ selected: number; correct: boolean }>>([]);

  // Customization state
  const [selectedBackground, setSelectedBackground] = useState(backgroundOptions[1]);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [playerName, setPlayerName] = useState("");

  // Settings state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showSettings, setShowSettings] = useState(false);

  // Audio references
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const completeSoundRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  // Responsive layout
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const currentQuestion = quizData?.quiz?.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / (quizData?.quiz?.questions?.length || 1)) * 100;

  // User context
  const { user, refresh: refreshUser } = useUser();
  const { addNotification } = useNotifications();
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const previousPoints = user?.points || 0;

  // Initialize audio elements
  useEffect(() => {
    correctSoundRef.current = new Audio("/sounds/correct.mp3");
    incorrectSoundRef.current = new Audio("/sounds/incorrect.mp3");
    clickSoundRef.current = new Audio("/sounds/click.mp3");
    completeSoundRef.current = new Audio("/sounds/complete.mp3");
    backgroundMusicRef.current = new Audio("/sounds/background-music.mp3");

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.3;
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    const volumeLevel = volume / 100;

    if (correctSoundRef.current) correctSoundRef.current.volume = volumeLevel;
    if (incorrectSoundRef.current) incorrectSoundRef.current.volume = volumeLevel;
    if (clickSoundRef.current) clickSoundRef.current.volume = volumeLevel;
    if (completeSoundRef.current) completeSoundRef.current.volume = volumeLevel;
    if (backgroundMusicRef.current) backgroundMusicRef.current.volume = volumeLevel * 0.3;
  }, [volume]);

  // Toggle background music
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (musicEnabled) {
        backgroundMusicRef.current.play().catch((e) => console.log("Audio play failed:", e));
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [musicEnabled]);

  const playSound = (sound: "correct" | "incorrect" | "click" | "complete") => {
    if (!soundEnabled) return;

    const soundMap = {
      correct: correctSoundRef.current,
      incorrect: incorrectSoundRef.current,
      click: clickSoundRef.current,
      complete: completeSoundRef.current,
    };

    const audio = soundMap[sound];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    }
  };

  const handleStartSetup = () => {
    playSound("click");
    setGameState("intro");
  };

  const handleStartQuiz = () => {
    playSound("click");
    setGameState("playing");
  };

  const handleSelectAnswer = async (index: number) => {
    if (selectedAnswerIndex !== null || showFeedback) return;

    setSelectedAnswerIndex(index);
    setShowFeedback(true);

    const isCorrect = index === currentQuestion?.correctIndex;

    if (isCorrect) {
      const points = pointsPerQuestion;
      setScore((prevScore) => prevScore + points);
      playSound("correct");
      // Small confetti burst for correct answer
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      playSound("incorrect");
    }

    // Save the answer
    setAnswers([...answers, { selected: index, correct: isCorrect }]);

    // Move to next question after delay
    setTimeout(async () => {
      if (currentQuestionIndex < (quizData?.quiz?.questions as IQuestion[]).length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswerIndex(null);
        setShowFeedback(false);
      } else {
        setGameState("results");
        playSound("complete");
        // Big confetti celebration at the end
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
        });

        // Award points and show dialog
        if (score > 0) {
          try {
            await awardPoints(
              score,
              PointsSource.QUIZ_COMPLETION,
              `Completed quiz with ${score} points`
            );

            // Show notification
            addNotification({
              type: NotificationType.QUIZ_COMPLETED,
              title: "Points Earned!",
              message: `You earned ${score} points for completing the quiz!`,
            });

            // Refresh user context to update points
            await refreshUser();

            // Show points dialog
            setShowPointsDialog(true);
          } catch (error) {
            console.error("Failed to award points:", error);
          }
        }
      }
    }, 1500);
  };

  const handleRestartQuiz = () => {
    playSound("click");
    setGameState("setup");
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setShowFeedback(false);
    setScore(0);
    setAnswers([]);
  };

  const toggleSettings = () => {
    playSound("click");
    setShowSettings(!showSettings);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-500 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${selectedBackground.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className={`absolute inset-0 ${selectedBackground.class} z-0`}></div>
      <div className="relative z-10 w-full flex items-center justify-center min-h-screen">
        {/* Settings Panel */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/90 border border-gray-700 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={toggleSettings}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Volume2 className="mr-2 h-5 w-5" />
                    Sound Effects
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-toggle">Enable Sound Effects</Label>
                    <Switch
                      id="sound-toggle"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="volume-slider">Volume</Label>
                      <span>{volume}%</span>
                    </div>
                    <Slider
                      id="volume-slider"
                      disabled={!soundEnabled}
                      min={0}
                      max={100}
                      step={1}
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Music className="mr-2 h-5 w-5" />
                    Background Music
                  </h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="music-toggle">Enable Background Music</Label>
                    <Switch
                      id="music-toggle"
                      checked={musicEnabled}
                      onCheckedChange={setMusicEnabled}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ImageIcon className="mr-2 h-5 w-5" />
                    Background Theme
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {backgroundOptions.map((bg) => (
                      <div
                        key={bg.id}
                        className={`
        p-1 rounded-lg cursor-pointer transition-all
        ${selectedBackground.id === bg.id ? "ring-2 ring-amber-400" : ""}
      `}
                        onClick={() => {
                          playSound("click");
                          setSelectedBackground(bg);
                        }}
                      >
                        <div
                          className="h-24 rounded-lg flex items-center justify-center p-2 bg-cover bg-center relative overflow-hidden"
                          style={{ backgroundImage: `url(${bg.image})` }}
                        >
                          <div className={`absolute inset-0 ${bg.class}`}></div>
                          <span className="relative z-10 text-sm text-center font-medium text-white drop-shadow-md">
                            {bg.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6" onClick={toggleSettings}>
                Save Settings
              </Button>
            </motion.div>
          </div>
        )}

        {/* Settings Button (always visible) */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 right-4 z-40 bg-black/30 border-white/20 hover:bg-black/50"
          onClick={toggleSettings}
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Sound Indicator */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-40 bg-black/30 border-white/20 hover:bg-black/50"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>

        <AnimatePresence mode="wait">
          {gameState === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl w-full mx-auto"
            >
              <Card className="p-8 bg-black/40 backdrop-blur-sm border-2 border-white/20 shadow-xl rounded-2xl">
                <h1 className="text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400">
                  Kenya History Quiz
                </h1>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-center">
                    Customize Your Experience
                  </h2>

                  <Tabs defaultValue="avatar" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="avatar">Choose Avatar</TabsTrigger>
                      <TabsTrigger value="background">Background</TabsTrigger>
                    </TabsList>

                    <TabsContent value="avatar" className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1 rounded-full">
                          <div className="bg-black/50 p-2 rounded-full">
                            <img
                              src={getAvatarUrl(selectedAvatar.seed) || "/placeholder.svg"}
                              alt={selectedAvatar.name}
                              className="w-24 h-24 rounded-full"
                            />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium">{selectedAvatar.name}</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {avatarOptions.map((avatar) => (
                          <div
                            key={avatar.id}
                            className={`
                            p-1 rounded-lg cursor-pointer transition-all
                            ${selectedAvatar.id === avatar.id ? "ring-2 ring-amber-400" : ""}
                          `}
                            onClick={() => {
                              playSound("click");
                              setSelectedAvatar(avatar);
                            }}
                          >
                            <div className="bg-black/30 rounded-lg p-2 flex flex-col items-center">
                              <img
                                src={getAvatarUrl(avatar.seed) || "/placeholder.svg"}
                                alt={avatar.name}
                                className="w-16 h-16 rounded-full mb-2"
                              />
                              <span className="text-xs text-center">{avatar.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <label className="block text-sm font-medium mb-2">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your name"
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 focus:border-amber-400 focus:outline-none"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="background">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {backgroundOptions.map((bg) => (
                          <div
                            key={bg.id}
                            className={`
                            p-1 rounded-lg cursor-pointer transition-all
                            ${selectedBackground.id === bg.id ? "ring-2 ring-amber-400" : ""}
                          `}
                            onClick={() => {
                              playSound("click");
                              setSelectedBackground(bg);
                            }}
                          >
                            <div
                              className={`${bg.class} h-24 rounded-lg flex items-center justify-center p-2`}
                              style={{
                                backgroundImage: `url(${bg.image})`,
                                backgroundSize: "cover",
                              }}
                            >
                              <span className="text-sm text-center font-medium">{bg.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Volume2 className="h-5 w-5 mr-2 text-amber-400" />
                      <span>Sound Effects</span>
                    </div>
                    <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                  </div>

                  <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Music className="h-5 w-5 mr-2 text-amber-400" />
                      <span>Background Music</span>
                    </div>
                    <Switch checked={musicEnabled} onCheckedChange={setMusicEnabled} />
                  </div>
                </div>

                <Button
                  onClick={handleStartSetup}
                  className="w-full mt-8 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Continue to Quiz
                </Button>
              </Card>
            </motion.div>
          )}

          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full mx-auto"
            >
              <Card className="p-8 bg-black/40 backdrop-blur-sm border-2 border-white/20 shadow-xl rounded-2xl">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{quizData.title}</h1>
                    <p className="text-white/80 mb-4">{quizData.description}</p>
                  </div>
                  <div className="flex items-center bg-black/30 p-2 rounded-lg">
                    <img
                      src={quizData.sponsor.logo || "/placeholder.svg"}
                      alt={quizData.sponsor.name}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-xs text-white/80">
                      Sponsored by {quizData.sponsor.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1 rounded-full mr-3">
                    <div className="bg-black/50 p-1 rounded-full">
                      <img
                        src={getAvatarUrl(selectedAvatar.seed) || "/placeholder.svg"}
                        alt={selectedAvatar.name}
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold">{playerName ? playerName : "Player"}</h3>
                    <p className="text-sm text-white/70">Ready to test your knowledge?</p>
                  </div>
                </div>

                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
                    <h3 className="font-semibold text-white">Quiz Details</h3>
                  </div>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-center">
                      <span className="w-40">Questions:</span>
                      <span className="font-semibold">
                        {(quizData?.quiz?.questions as IQuestion[]).length}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-40">Points per question:</span>
                      <span className="font-semibold">{pointsPerQuestion}</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-40">Total points:</span>
                      <span className="font-semibold">{(quizData.quiz as IQuiz).points}</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleStartQuiz}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Quiz
                </Button>
              </Card>
            </motion.div>
          )}

          {gameState === "playing" && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl w-full mx-auto"
            >
              <Card className="p-6 md:p-8 bg-black/40 backdrop-blur-sm border-2 border-white/20 shadow-xl rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-0.5 rounded-full mr-2">
                      <div className="bg-black/50 p-0.5 rounded-full">
                        <img
                          src={getAvatarUrl(selectedAvatar.seed) || "/placeholder.svg"}
                          alt={selectedAvatar.name}
                          className="w-8 h-8 rounded-full"
                        />
                      </div>
                    </div>
                    <div className="bg-black/30 px-3 py-1 rounded-full text-sm font-medium">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quizData?.quiz?.questions?.length || 0}
                    </div>
                  </div>
                  <div className="bg-black/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Trophy className="h-4 w-4 text-yellow-400 mr-1" />
                    Score: {score}
                  </div>
                </div>

                <Progress value={progress} className="h-2 mb-6 bg-black/30">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
                </Progress>

                {currentQuestion && (
                  <motion.div
                    key={`question-${currentQuestionIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                  >
                    <h2
                      className={`${
                        isDesktop ? "text-2xl" : "text-xl"
                      } font-semibold mb-6 text-white`}
                    >
                      {currentQuestion.question}
                    </h2>

                    <div className={`${isDesktop ? "grid grid-cols-2 gap-3" : "space-y-3"}`}>
                      {currentQuestion.options.map((option, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: selectedAnswerIndex === null ? 1.02 : 1 }}
                          className={`
                        p-4 rounded-lg cursor-pointer transition-all duration-300
                        ${selectedAnswerIndex === null ? "bg-black/30 hover:bg-black/40" : ""}
                        ${
                          showFeedback && index === currentQuestion.correctIndex
                            ? "bg-green-600/70 border-2 border-green-400"
                            : ""
                        }
                        ${
                          showFeedback &&
                          index === selectedAnswerIndex &&
                          index !== currentQuestion.correctIndex
                            ? "bg-red-600/70 border-2 border-red-400"
                            : ""
                        }
                        ${
                          showFeedback &&
                          index !== selectedAnswerIndex &&
                          index !== currentQuestion.correctIndex
                            ? "opacity-50"
                            : ""
                        }
                      `}
                          onClick={() => handleSelectAnswer(index)}
                        >
                          <div className="flex items-center">
                            <div
                              className={`
                            h-6 w-6 rounded-full mr-3 flex items-center justify-center text-sm font-medium
                            ${selectedAnswerIndex === null ? "bg-black/50" : ""}
                            ${
                              showFeedback && index === currentQuestion.correctIndex
                                ? "bg-green-500"
                                : ""
                            }
                            ${
                              showFeedback &&
                              index === selectedAnswerIndex &&
                              index !== currentQuestion.correctIndex
                                ? "bg-red-500"
                                : ""
                            }
                          `}
                            >
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1">{option}</span>

                            {showFeedback && index === currentQuestion.correctIndex && (
                              <CheckCircle2 className="h-5 w-5 text-green-300 ml-2" />
                            )}

                            {showFeedback &&
                              index === selectedAnswerIndex &&
                              index !== currentQuestion.correctIndex && (
                                <XCircle className="h-5 w-5 text-red-300 ml-2" />
                              )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {showFeedback && currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      selectedAnswerIndex === currentQuestion.correctIndex
                        ? "bg-green-600/30"
                        : "bg-red-600/30"
                    }`}
                  >
                    <div className="flex items-center">
                      {selectedAnswerIndex === currentQuestion.correctIndex ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-300 mr-2" />
                          <span className="font-medium text-green-200">
                            Correct! +{pointsPerQuestion} points
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-300 mr-2" />
                          <span className="font-medium text-red-200">
                            Incorrect. The correct answer is{" "}
                            {String.fromCharCode(65 + currentQuestion.correctIndex)}:{" "}
                            {currentQuestion.options[currentQuestion.correctIndex]}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {gameState === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full mx-auto"
            >
              <Card className="p-8 bg-black/40 backdrop-blur-sm border-2 border-white/20 shadow-xl rounded-2xl">
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-full mb-4"
                  >
                    <Trophy className="h-12 w-12 text-white" />
                  </motion.div>
                  <h1 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h1>

                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-1 rounded-full mr-3">
                      <div className="bg-black/50 p-1 rounded-full">
                        <img
                          src={getAvatarUrl(selectedAvatar.seed) || "/placeholder.svg"}
                          alt={selectedAvatar.name}
                          className="w-12 h-12 rounded-full"
                        />
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-white">
                      {playerName ? playerName : "Player"}
                    </p>
                  </div>

                  <p className="text-white/80 mb-4">Your final score:</p>
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-200 mb-2">
                    {score} / {quizData.quiz?.points || 0}
                  </div>
                  <p className="text-white/80">
                    {score === (quizData.quiz?.points || 0)
                      ? "Perfect score! Amazing job!"
                      : score >= (quizData.quiz?.points || 0) * 0.8
                      ? "Great job! You know your Kenya history!"
                      : score >= (quizData.quiz?.points || 0) * 0.6
                      ? "Good effort! You're on your way to becoming a Kenya history expert."
                      : "Keep learning about Kenya's fascinating history!"}
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-white mb-4">Your Answers</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {answers.map((answer, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          answer.correct ? "bg-green-600/30" : "bg-red-600/30"
                        }`}
                      >
                        <p className="text-sm font-medium mb-1">Question {index + 1}</p>
                        <p className="text-xs mb-2">{quizData.quiz?.questions[index]?.question}</p>
                        <div className="flex items-center">
                          {answer.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-green-300 mr-2 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-300 mr-2 flex-shrink-0" />
                          )}
                          <span className="text-xs">
                            {answer.correct
                              ? `Correct: ${
                                  quizData.quiz?.questions[index]?.options[answer.selected]
                                }`
                              : `You selected: ${
                                  quizData.quiz?.questions[index]?.options[answer.selected]
                                }, Correct: ${
                                  quizData.quiz?.questions[index]?.options[
                                    quizData.quiz?.questions[index]?.correctIndex || 0
                                  ]
                                }`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleRestartQuiz}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Play Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio elements */}
        <audio id="correct-sound" src="/sounds/correct.mp3" preload="auto" />
        <audio id="incorrect-sound" src="/sounds/incorrect.mp3" preload="auto" />
        <audio id="click-sound" src="/sounds/click.mp3" preload="auto" />
        <audio id="complete-sound" src="/sounds/complete.mp3" preload="auto" />
        <audio id="background-music" src="/sounds/background-music.mp3" loop preload="auto" />

        {showPointsDialog && (
          <PointsEarnedDialog
            points={score}
            open={showPointsDialog}
            onClose={() => setShowPointsDialog(false)}
            previousPoints={previousPoints}
          />
        )}
      </div>
    </div>
  );
}
