import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Divider,
  styled,
} from "@mui/material";
import {
  Favorite,
  Bookmark,
  PlayArrow,
  Close,
  Star,
} from "@mui/icons-material";
import ReactPlayer from "react-player";
import {
  swipeRightAnimation,
  swipeLeftAnimation,
  likeAnimation,
  saveAnimation,
  heartTrailAnimation,
} from "../utils/animations";
import { hapticFeedback } from "../utils/haptics";
import { useTheme } from "../theme/ThemeProvider";

// Styled components for animated cards and buttons
const AnimatedCard = styled(Card)`
  &.swipe-right {
    animation: ${swipeRightAnimation} 0.5s ease forwards;
  }
  &.swipe-left {
    animation: ${swipeLeftAnimation} 0.5s ease forwards;
  }
`;

// Styled components for animated buttons
const AnimatedIconButton = styled(IconButton)`
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.2);
  }
`;

const LikeButton = styled(AnimatedIconButton)`
  &.animate {
    animation: ${likeAnimation} 0.5s ease;
  }
`;

const SaveButton = styled(AnimatedIconButton)`
  &.animate {
    animation: ${saveAnimation} 0.5s ease;
  }
`;

const HeartTrail = styled(Box)`
  position: absolute;
  pointer-events: none;
  animation: ${heartTrailAnimation} 2s ease-out forwards;
`;

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    videoUrl?: string;
    release_date: string;
    vote_average: number;
    runtime?: number;
    genres?: { id: number; name: string }[];
    cast?: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  onSwipe: (direction: "left" | "right") => void;
  onSave: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSwipe, onSave }) => {
  const { mode } = useTheme();
  const [showTrailer, setShowTrailer] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const heartIdRef = useRef(0);

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
  }, [movie.id]);

  const handleSwipe = async (direction: "left" | "right") => {
    if (isAnimating) return;

    try {
      setIsAnimating(true);
      const card = cardRef.current;
      if (!card) return;

      // Reset any existing transforms
      card.style.transform = "none";
      card.style.boxShadow = "none";

      // Add animation class based on direction
      card.classList.add(direction === "right" ? "swipe-right" : "swipe-left");

      // Trigger haptic feedback
      if (direction === "right") {
        hapticFeedback.success();
      } else {
        hapticFeedback.light();
      }

      // Wait for animation to complete before calling onSwipe
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSwipe(direction);
    } catch (error) {
      console.error("Error during swipe:", error);
    } finally {
      setIsAnimating(false);
      const card = cardRef.current;
      if (card) {
        card.classList.remove("swipe-right", "swipe-left");
      }
    }
  };

  const handleLike = async () => {
    if (isAnimating) return;

    try {
      const button = likeButtonRef.current;
      if (button) {
        button.classList.add("animate");
        hapticFeedback.success();

        // Create heart trail
        const rect = button.getBoundingClientRect();
        const newHearts = Array.from({ length: 15 }, () => ({
          id: heartIdRef.current++,
          x: rect.left + rect.width / 2 + (Math.random() * 40 - 20),
          y: rect.top + rect.height / 2,
        }));
        setHearts((prev) => [...prev, ...newHearts]);

        // Remove hearts after animation
        setTimeout(() => {
          setHearts((prev) =>
            prev.filter((h) => !newHearts.some((nh) => nh.id === h.id))
          );
        }, 2000);

        setTimeout(() => button.classList.remove("animate"), 500);
      }

      await handleSwipe("right");
    } catch (error) {
      console.error("Error during like:", error);
      hapticFeedback.error();
    }
  };

  const handleSave = async () => {
    if (isAnimating) return;

    try {
      const button = saveButtonRef.current;
      if (button) {
        button.classList.add("animate");
        hapticFeedback.medium();
        setTimeout(() => button.classList.remove("animate"), 500);
      }

      await onSave();
    } catch (error) {
      console.error("Error during save:", error);
      hapticFeedback.error();
    }
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (showTrailer || isAnimating) return;
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: 0 });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || showTrailer || isAnimating) return;
      e.preventDefault();
      const deltaX = e.touches[0].clientX - dragStart.x;
      setDragOffset({ x: deltaX, y: 0 });

      // Calculate rotation and translation
      const rotation = Math.min(Math.max(deltaX / 10, -30), 30);
      card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

      // Add visual feedback
      if (deltaX > 50) {
        card.style.boxShadow = "0 0 20px 5px rgba(0, 255, 0, 0.3)";
      } else if (deltaX < -50) {
        card.style.boxShadow = "0 0 20px 5px rgba(255, 0, 0, 0.3)";
      } else {
        card.style.boxShadow = "none";
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging || isAnimating) return;
      const threshold = 100;
      if (Math.abs(dragOffset.x) > threshold) {
        handleSwipe(dragOffset.x > 0 ? "right" : "left");
      } else {
        // Reset card position with smooth animation
        card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
        card.style.transform = "none";
        card.style.boxShadow = "none";
        setTimeout(() => {
          card.style.transition = "";
        }, 300);
      }
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    };

    card.addEventListener("touchstart", handleTouchStart, { passive: true });
    card.addEventListener("touchmove", handleTouchMove, { passive: false });
    card.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchmove", handleTouchMove);
      card.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart, dragOffset, showTrailer, isAnimating]);

  const handleDragStart = (clientX: number) => {
    if (showTrailer || isAnimating) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: 0 });
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || showTrailer || isAnimating) return;

    const deltaX = clientX - dragStart.x;
    setDragOffset({ x: deltaX, y: 0 });

    const card = cardRef.current;
    if (!card) return;

    // Calculate rotation and translation
    const rotation = Math.min(Math.max(deltaX / 10, -30), 30);
    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

    // Add visual feedback
    if (deltaX > 50) {
      card.style.boxShadow = "0 0 20px 5px rgba(0, 255, 0, 0.3)";
    } else if (deltaX < -50) {
      card.style.boxShadow = "0 0 20px 5px rgba(255, 0, 0, 0.3)";
    } else {
      card.style.boxShadow = "none";
    }
  };

  const handleDragEnd = () => {
    if (!isDragging || isAnimating) return;

    const card = cardRef.current;
    if (!card) return;

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? "right" : "left");
    } else {
      // Reset card position with smooth animation
      card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      card.style.transform = "none";
      card.style.boxShadow = "none";
      setTimeout(() => {
        card.style.transition = "";
      }, 300);
    }

    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  // Mouse event handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleCardClick = () => {
    // Prevent card click if we're in the middle of a drag
    if (isDragging) return;
    setShowTrailer(true);
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <AnimatedCard
      ref={cardRef}
      className="movie-card"
      sx={{
        maxWidth: 345,
        margin: "auto",
        position: "relative",
        cursor: showTrailer ? "default" : "pointer",
        userSelect: "none",
        transition: "all 0.3s ease",
        touchAction: "none",
        bgcolor: mode === "dark" ? "background.paper" : "background.default",
        "&:hover": {
          boxShadow:
            mode === "dark"
              ? "0 8px 16px rgba(255,255,255,0.1)"
              : "0 8px 16px rgba(0,0,0,0.2)",
          transform: "translateY(-5px)",
        },
      }}
      onClick={handleCardClick}
      onMouseDown={(e) => {
        // Only start drag if clicking on the card content, not the buttons
        if (!(e.target as HTMLElement).closest(".action-buttons")) {
          handleDragStart(e.clientX);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {hearts.map((heart) => (
        <HeartTrail
          key={heart.id}
          sx={{
            left: heart.x,
            top: heart.y,
            color: "error.main",
            fontSize: "1.5rem",
          }}
        >
          <Favorite />
        </HeartTrail>
      ))}
      {!showTrailer ? (
        <>
          <CardMedia
            component="img"
            height="500"
            image={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {movie.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Star sx={{ color: "gold", mr: 0.5 }} />
              <Typography variant="body2" color="text.secondary">
                {movie.vote_average.toFixed(1)}/10
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(movie.release_date).getFullYear()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                •
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatRuntime(movie.runtime)}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              {movie.genres?.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  size="small"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {movie.overview}
            </Typography>
          </CardContent>
          <Box
            className="action-buttons"
            sx={{
              display: "flex",
              justifyContent: "space-between",
              p: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            <LikeButton
              ref={likeButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              color="error"
              sx={{
                "&:hover": {
                  color: "#ff1744",
                  transform: "scale(1.2) rotate(10deg)",
                },
              }}
            >
              <Favorite />
            </LikeButton>
            <AnimatedIconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowTrailer(true);
              }}
              color="primary"
              disabled={!movie.videoUrl}
            >
              <PlayArrow />
            </AnimatedIconButton>
            <SaveButton
              ref={saveButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              color="primary"
              sx={{
                "&:hover": {
                  color: "#2196f3",
                  transform: "scale(1.2)",
                },
              }}
            >
              <Bookmark />
            </SaveButton>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ position: "relative", width: "100%", height: 500 }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setShowTrailer(false);
              }}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
                bgcolor: "rgba(0, 0, 0, 0.6)",
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                },
              }}
            >
              <Close sx={{ color: "white" }} />
            </IconButton>
            {movie.videoUrl && (
              <ReactPlayer
                url={movie.videoUrl}
                width="100%"
                height="100%"
                controls
                playing
                style={{ backgroundColor: "black" }}
                config={{
                  youtube: {
                    playerVars: { modestbranding: 1 },
                  },
                }}
              />
            )}
          </Box>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {movie.title}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {movie.overview}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Cast
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              {movie.cast?.map((member) => (
                <Box
                  key={member.id}
                  sx={{
                    width: "calc(33.33% - 16px)",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w200${member.profile_path}`
                        : undefined
                    }
                    sx={{ width: 56, height: 56, margin: "0 auto", mb: 1 }}
                  />
                  <Typography variant="body2" noWrap>
                    {member.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {member.character}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {movie.genres?.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </>
      )}
    </AnimatedCard>
  );
};

export default MovieCard;
