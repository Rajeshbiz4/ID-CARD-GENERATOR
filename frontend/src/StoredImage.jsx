import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import { api } from "./api";

export function useStoredImage(
  fileId
) {
  const [state, setState] =
    useState({
      src: "",
      loading: Boolean(fileId),
    });

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    if (!fileId) {
      setState({
        src: "",
        loading: false,
      });

      return undefined;
    }

    setState({
      src: "",
      loading: true,
    });

    api
      .get(
        `/files/${fileId}`,
        {
          responseType: "blob",
          skipGlobalLoader: true,
        }
      )
      .then((response) => {
        if (!active) return;

        objectUrl =
          URL.createObjectURL(
            response.data
          );

        setState({
          src: objectUrl,
          loading: false,
        });
      })
      .catch(() => {
        if (active) {
          setState({
            src: "",
            loading: false,
          });
        }
      });

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl
        );
      }
    };
  }, [fileId]);

  return state;
}

export default function StoredImage({
  fileId,
  alt = "",
  sx,
  fallback,
}) {
  const {
    src,
    loading,
  } = useStoredImage(fileId);

  if (loading) {
    return (
      <Box
        sx={{
          ...sx,
          display: "grid",
          placeItems: "center",
          bgcolor: "#eef2f7",
        }}
      >
        <CircularProgress
          size={18}
        />
      </Box>
    );
  }

  if (!src && fallback) {
    return fallback;
  }

  if (!src) {
    return null;
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={sx}
    />
  );
}
