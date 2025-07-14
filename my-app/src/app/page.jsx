"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

export default function Home() {
  const [step, setStep] = useState("intro");
  const [showKissingBear, setShowKissingBear] = useState(false);

  const handleYes = () => {
    setShowKissingBear(true);
    setStep("romantic");
  };

  const handleNo = () => {
    setStep("rapunzel");
  };

  const tryAgain = () => {
    setStep("question");
  };

  const handleRomanticYes = () => {
    setStep("finalYes");
  };

  const handleRomanticNo = () => {
    setStep("stuck");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff"
      }}
    >
      {step === "intro" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Welcome to Our Story
          </Typography>

          <Button variant="contained" color="primary" onClick={() => setStep("question")}>
            Click Me
          </Button>
        </Box>
      )}

      {step === "question" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Have you enjoyed our relationship so far?
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleYes}>
              Yes
            </Button>

            <Button variant="outlined" color="secondary" onClick={handleNo}>
              No
            </Button>
          </Box>
        </Box>
      )}

      {step === "rapunzel" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Box
            component="img"
            src="/rapunzel.png"
            alt="Rapunzel"
            sx={{
              width: "300px",
              height: "300px",
              objectFit: "contain",
              mb: 2
            }}
          />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Try again
          </Typography>
          <Button variant="contained" onClick={tryAgain}>
            Go Back
          </Button>
        </Box>
      )}

      {step === "romantic" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            Would you like to continue this love story forever?
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleRomanticYes}>
              Yes
            </Button>

            <Button variant="outlined" color="secondary" onClick={handleRomanticNo}>
              No
            </Button>
          </Box>
        </Box>
      )}

     {step === "finalYes" && (
  <>
    {/* Lily Grid (9 per row minimum) */}
    {Array.from({ length: 9 * Math.ceil(window.innerHeight / 400) }).map((_, i) => (
      <Box
        key={i}
        component="img"
        src="/lily.png"
        alt="Lily"
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          objectFit: "contain",
          top: `${Math.floor(i / 9) * 400}px`,
          left: `${(i % 9) * 400}px`,
          animation: "sprout 2s ease forwards",
          animationDelay: `${Math.random() * 2}s`,
          opacity: 0,
          zIndex: 0
        }}
      />
    ))}

    {/* Center Text */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        zIndex: 1
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Happy anniversary babe, I love you loads ❤️
      </Typography>
    </Box>

    {/* Bears */}
    <Box
      component="img"
      src="/bear.png"
      alt="Bear Left"
      sx={{
        position: "absolute",
        bottom: "0px",
        left: "0px",
        width: "600px",
        height: "600px",
        objectFit: "contain",
        zIndex: 0
      }}
    />

    <Box
      component="img"
      src="/bearkissing.gif"
      alt="Kissing Bear"
      sx={{
        position: "absolute",
        bottom: "0px",
        right: "0px",
        width: "600px",
        height: "600px",
        objectFit: "contain",
        zIndex: 0
      }}
    />

    <Box
      component="img"
      src="/beargivingflower.gif"
      alt="Giving Flower"
      sx={{
        position: "absolute",
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "600px",
        objectFit: "contain",
        zIndex: 0
      }}
    />

    <style jsx global>{`
      @keyframes sprout {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </>
)}


      {step === "stuck" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            It's too late, you're stuck with me forever.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setStep("finalYes")}>
            Go Back
          </Button>
        </Box>
      )}

      {step === "illegalNo" && (
        <Box
          sx={{
            textAlign: "center",
            zIndex: 1,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "100%"
          }}
        >
          <Typography variant="h5" sx={{ mb: 2 }}>
            We've been over this, you can't press no—it's illegal.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setStep("finalYes")}>
            Go Back
          </Button>
        </Box>
      )}

      {(step === "intro" || step === "question" || step === "romantic") && (
        <Box
          component="img"
          src="/bear.png"
          alt="Bear"
          sx={{
            position: "absolute",
            bottom: "0px",
            left: "0px",
            width: "600px",
            height: "600px",
            objectFit: "contain",
            zIndex: 0
          }}
        />
      )}

      {showKissingBear && step === "romantic" && (
        <Box
          component="img"
          src="/bearkissing.gif"
          alt="Kissing Bear"
          sx={{
            position: "absolute",
            bottom: "0px",
            right: "0px",
            width: "600px",
            height: "600px",
            objectFit: "contain",
            zIndex: 0
          }}
        />
      )}
    </Box>
  );
}
