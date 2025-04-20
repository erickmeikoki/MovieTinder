import React from "react";
import { Card, CardContent, Box, Skeleton } from "@mui/material";

const MovieCardSkeleton: React.FC = () => {
  return (
    <Card sx={{ maxWidth: 345, margin: "auto" }}>
      <Skeleton
        variant="rectangular"
        height={500}
        animation="wave"
        sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }}
      />
      <CardContent>
        <Skeleton
          variant="text"
          height={32}
          width="80%"
          sx={{ mb: 1 }}
          animation="wave"
        />
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Skeleton
            variant="circular"
            width={20}
            height={20}
            animation="wave"
          />
          <Skeleton variant="text" width={40} sx={{ ml: 1 }} animation="wave" />
          <Skeleton variant="text" width={60} sx={{ ml: 2 }} animation="wave" />
        </Box>
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={60}
              height={24}
              sx={{ borderRadius: 1 }}
              animation="wave"
            />
          ))}
        </Box>
        <Skeleton variant="text" height={80} animation="wave" />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 2,
            px: 2,
          }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="circular"
              width={40}
              height={40}
              animation="wave"
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCardSkeleton;
