import {
  useEffect,
  useState,
} from "react";

import {
  Box,
  CircularProgress,
} from "@mui/material";

import { api } from "./api";

import {
  normalizeSignatureBlob,
} from "./imageProcessor";

const imageCache =
  new Map();

async function fetchImage(
  fileId,
  processor
) {
  const cacheKey =
    `${fileId}:${processor || "raw"}`;

  if (
    imageCache.has(
      cacheKey
    )
  ) {
    return imageCache.get(
      cacheKey
    );
  }

  const promise =
    api
      .get(
        `/files/${fileId}`,
        {
          responseType:
            "blob",
          skipGlobalLoader:
            true,
        }
      )
      .then(
        async (
          response
        ) => {
          let blob =
            response.data;

          if (
            processor ===
            "signature"
          ) {
            blob =
              await normalizeSignatureBlob(
                blob
              );
          }

          return URL.createObjectURL(
            blob
          );
        }
      )
      .catch(
        (error) => {
          imageCache.delete(
            cacheKey
          );

          throw error;
        }
      );

  imageCache.set(
    cacheKey,
    promise
  );

  return promise;
}

export function useStoredImage(
  fileId,
  processor = null
) {
  const [state, setState] =
    useState({
      src: "",
      loading:
        Boolean(fileId),
    });

  useEffect(() => {
    let active = true;

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

    fetchImage(
      fileId,
      processor
    )
      .then((src) => {
        if (!active) {
          return;
        }

        setState({
          src,
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
    };
  }, [
    fileId,
    processor,
  ]);

  return state;
}

export default function StoredImage({
  fileId,
  alt = "",
  sx,
  fallback,
  processor = null,
}) {
  const {
    src,
    loading,
  } = useStoredImage(
    fileId,
    processor
  );

  if (loading) {
    return (
      <Box
        sx={{
          ...sx,
          display: "grid",
          placeItems:
            "center",
          bgcolor:
            "rgba(248,250,252,.85)",
        }}
      >
        <CircularProgress
          size={16}
        />
      </Box>
    );
  }

  if (
    !src &&
    fallback
  ) {
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
