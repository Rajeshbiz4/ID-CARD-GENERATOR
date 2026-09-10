import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Backdrop,
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";

import {
  getLoadingState,
  subscribeLoading,
} from "./loaderStore";

const MIN_VISIBLE_MS = 850;

export default function GlobalLoader() {
  const initial =
    getLoadingState();

  const [visible, setVisible] =
    useState(initial.loading);

  const [count, setCount] =
    useState(initial.count);

  const shownAt =
    useRef(
      initial.loading
        ? Date.now()
        : 0
    );

  const hideTimer =
    useRef(null);

  useEffect(() => {
    const unsubscribe =
      subscribeLoading(
        ({ loading, count }) => {
          setCount(count);

          if (hideTimer.current) {
            clearTimeout(
              hideTimer.current
            );

            hideTimer.current = null;
          }

          if (loading) {
            if (!shownAt.current) {
              shownAt.current =
                Date.now();
            }

            setVisible(true);
            return;
          }

          const elapsed =
            shownAt.current
              ? Date.now() -
                shownAt.current
              : MIN_VISIBLE_MS;

          const remaining =
            Math.max(
              0,
              MIN_VISIBLE_MS -
                elapsed
            );

          hideTimer.current =
            setTimeout(
              () => {
                setVisible(false);
                shownAt.current = 0;
                hideTimer.current =
                  null;
              },
              remaining
            );
        }
      );

    return () => {
      unsubscribe();

      if (hideTimer.current) {
        clearTimeout(
          hideTimer.current
        );
      }
    };
  }, []);

  return (
    <>
      {visible && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            zIndex: 25001,
          }}
        />
      )}

      <Backdrop
        open={visible}
        sx={{
          zIndex: 25000,
          bgcolor:
            "rgba(15, 23, 42, 0.44)",
          backdropFilter:
            "blur(2px)",
        }}
      >
        <Box
          sx={{
            width: 230,
            bgcolor: "#ffffff",
            border:
              "1px solid #dbe3ec",
            boxShadow:
              "0 24px 60px rgba(15,23,42,.28)",
            px: 3,
            py: 3,
            textAlign: "center",
          }}
        >
          <CircularProgress
            size={42}
            thickness={4.5}
          />

          <Typography
            sx={{
              mt: 1.8,
              fontWeight: 900,
              fontSize: 15,
              color: "#0f172a",
            }}
          >
            Loading...
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Please wait while content loads.
          </Typography>

          {count > 1 && (
            <Typography
              sx={{
                mt: 1,
                fontSize: 10.5,
                color: "#94a3b8",
              }}
            >
              {count} requests in progress
            </Typography>
          )}
        </Box>
      </Backdrop>
    </>
  );
}
