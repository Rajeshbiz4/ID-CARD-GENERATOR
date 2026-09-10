import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  TranslateRounded,
} from "@mui/icons-material";

import {
  ReactTransliterate,
} from "@sarthak1407/react-transliterate";

const STORAGE_KEY =
  "sid_typing_language";

export function useTypingLanguage() {
  const [
    typingLanguage,
    setTypingLanguageState,
  ] = useState(() => {
    return (
      localStorage.getItem(
        STORAGE_KEY
      ) || "en"
    );
  });

  const setTypingLanguage =
    (language) => {
      const value =
        language === "mr"
          ? "mr"
          : "en";

      localStorage.setItem(
        STORAGE_KEY,
        value
      );

      setTypingLanguageState(
        value
      );
    };

  return [
    typingLanguage,
    setTypingLanguage,
  ];
}

export function TypingLanguageBar({
  value,
  onChange,
}) {
  const marathi =
    value === "mr";

  return (
    <Alert
      severity="info"
      icon={
        <TranslateRounded />
      }
      sx={{
        mb: 2,
        width: "100%",
        overflow: "visible",
        "& .MuiAlert-message": {
          width: "100%",
          minWidth: 0,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.5}
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
        justifyContent="space-between"
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              overflowWrap:
                "anywhere",
            }}
          >
            Typing language / टायपिंग भाषा
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflowWrap:
                "anywhere",
            }}
          >
            {marathi
              ? "मराठी Phonetic चालू आहे. English letters मध्ये शब्द टाइप करा आणि Marathi suggestion निवडा."
              : "English typing is active. Marathi typing साठी मराठी Phonetic निवडा."}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={0}
          sx={{
            border:
              "1px solid #cbd5e1",
            bgcolor: "#ffffff",
            flexShrink: 0,
            alignSelf: {
              xs: "stretch",
              md: "center",
            },
          }}
        >
          <Button
            type="button"
            fullWidth
            variant={
              !marathi
                ? "contained"
                : "text"
            }
            onClick={() =>
              onChange("en")
            }
            sx={{
              minWidth: {
                xs: 0,
                sm: 110,
              },
            }}
          >
            English
          </Button>

          <Button
            type="button"
            fullWidth
            variant={
              marathi
                ? "contained"
                : "text"
            }
            onClick={() =>
              onChange("mr")
            }
            sx={{
              minWidth: {
                xs: 0,
                sm: 145,
              },
            }}
          >
            मराठी Phonetic
          </Button>
        </Stack>
      </Stack>
    </Alert>
  );
}

export function MarathiTextField({
  typingLanguage = "en",
  value = "",
  onValueChange,
  inputProps,
  InputProps,
  ...textFieldProps
}) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  const blurTimerRef =
    useRef(null);

  useEffect(() => {
    return () => {
      if (
        blurTimerRef.current
      ) {
        clearTimeout(
          blurTimerRef.current
        );
      }
    };
  }, []);

  const activate = () => {
    if (
      blurTimerRef.current
    ) {
      clearTimeout(
        blurTimerRef.current
      );
    }

    setFocused(true);
  };

  const deactivate = () => {
    if (
      blurTimerRef.current
    ) {
      clearTimeout(
        blurTimerRef.current
      );
    }

    // Delay allows mouse/touch selection from the suggestion box
    // to finish before the reserved space collapses.
    blurTimerRef.current =
      setTimeout(() => {
        setFocused(false);
      }, 220);
  };

  if (
    typingLanguage !== "mr"
  ) {
    return (
      <TextField
        {...textFieldProps}
        fullWidth
        value={value ?? ""}
        onChange={(event) =>
          onValueChange(
            event.target.value
          )
        }
        InputProps={
          InputProps
        }
        inputProps={{
          ...inputProps,
          lang: "en",
        }}
      />
    );
  }

  return (
    <Box
      className={
        focused
          ? "marathi-field-shell marathi-field-shell--active"
          : "marathi-field-shell"
      }
    >
      <Box
        className="marathi-transliterate"
      >
        <ReactTransliterate
          value={value ?? ""}
          onChangeText={(
            text
          ) =>
            onValueChange(
              text
            )
          }
          lang="mr"
          enabled
          maxOptions={5}
          showCurrentWordAsLastSuggestion
          debounceMs={120}
          minWordLength={1}
          containerClassName="marathi-transliterate-container"
          suggestionsClassName="marathi-suggestion-list"
          itemClassName="marathi-suggestion-item"
          activeItemClassName="marathi-suggestion-item--active"
          onSuggestionsError={(
            error
          ) => {
            console.warn(
              "Marathi transliteration suggestions unavailable:",
              error?.message ||
                error
            );
          }}
          renderComponent={(
            transliterateProps
          ) => {
            const {
              ref,
              onFocus:
                libraryOnFocus,
              onBlur:
                libraryOnBlur,
              ...fieldProps
            } =
              transliterateProps;

            return (
              <TextField
                {...textFieldProps}
                {...fieldProps}
                fullWidth
                inputRef={ref}
                InputProps={
                  InputProps
                }
                onFocus={(
                  event
                ) => {
                  activate();

                  libraryOnFocus?.(
                    event
                  );

                  textFieldProps
                    .onFocus?.(
                      event
                    );
                }}
                onBlur={(
                  event
                ) => {
                  libraryOnBlur?.(
                    event
                  );

                  textFieldProps
                    .onBlur?.(
                      event
                    );

                  deactivate();
                }}
                inputProps={{
                  ...inputProps,
                  lang: "mr",
                  autoComplete:
                    "off",
                }}
              />
            );
          }}
        />
      </Box>
    </Box>
  );
}
