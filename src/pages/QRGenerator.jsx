import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// import { QRCodeSVG } from "qrcode.react";
import StyledQRCode from "../components/StyledQRCode";
import { jsPDF } from "jspdf";
import {
  QrCode,
  UserPlus,
  Gamepad2,
  Download,
  Copy,
  ExternalLink,
  Info,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  ShieldCheck,
  LayoutDashboard,
  Database,
  FileText,
  Search,
  Sliders,
  Settings2,
  Palette,
  Bookmark,
  Sparkles,
  RotateCcw,
  FolderOpen,
  Layers,
} from "lucide-react";
import api from "../api/apiconfig";
import showToast from "../utils/ToastNotification";
import { useRef } from "react";
import { toPng } from "html-to-image";
import QRStyleOption from "../components/QRStyleOption";



const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const getWrappedLines = (ctx, text, maxWidth) => {
  if (!text) return [];

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = "";

  const splitLongWord = (word) => {
    const chunks = [];
    let chunk = "";

    for (const char of word) {
      const testChunk = chunk + char;
      if (ctx.measureText(testChunk).width <= maxWidth || !chunk) {
        chunk = testChunk;
      } else {
        chunks.push(chunk);
        chunk = char;
      }
    }

    if (chunk) chunks.push(chunk);
    return chunks;
  };

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        const chunks = splitLongWord(word);
        if (chunks.length > 0) {
          lines.push(...chunks.slice(0, -1));
          currentLine = chunks[chunks.length - 1];
        }
      }
    } else {
      lines.push(currentLine);
      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
      } else {
        const chunks = splitLongWord(word);
        if (chunks.length > 0) {
          lines.push(...chunks.slice(0, -1));
          currentLine = chunks[chunks.length - 1];
        }
      }
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const measureWrappedText = (ctx, text, maxWidth, lineHeight) => {
  const lines = getWrappedLines(ctx, text, maxWidth);
  return {
    lines,
    height: lines.length > 0 ? lines.length * lineHeight : 0,
  };
};

const drawWrappedText = (ctx, lines, x, y, lineHeight) => {
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
};

const normalizePreferenceItem = (item) => {
  if (!item || typeof item !== "object") {
    return { key: "", question: "", section: "" };
  }

  return {
    key: typeof item.key === "string" ? item.key : "",
    question: typeof item.question === "string" ? item.question : "",
    section: typeof item.section === "string" ? item.section : "",
  };
};

const normalizeQrStyle = (style) => {
  if (typeof style === "string") {
    return {
      bodyShape: style || "square",
      eyeFrame: "square",
      eyeBall: "square",
    };
  }

  if (!style || typeof style !== "object") {
    return {
      bodyShape: "square",
      eyeFrame: "square",
      eyeBall: "square",
    };
  }

  return {
    bodyShape:
      typeof style.bodyShape === "string" && style.bodyShape
        ? style.bodyShape
        : "square",
    eyeFrame:
      typeof style.eyeFrame === "string" && style.eyeFrame
        ? style.eyeFrame
        : "square",
    eyeBall:
      typeof style.eyeBall === "string" && style.eyeBall
        ? style.eyeBall
        : "square",
  };
};

const formatPreferenceSection = (section) => {
  if (!section || typeof section !== "string") {
    return "";
  }

  return section.replace(/([A-Z])/g, " $1").trim();
};

const canUseLogoInCanvas = (src) => {
  if (!src || typeof src !== "string") {
    return false;
  }

  return src.startsWith("data:") || src.startsWith("blob:");
};

const bodyStyles = [
  {
    id: "square",
    options: {
      dotsOptions: {
        type: "square",
      },
    },
  },
  {
    id: "dots",
    options: {
      dotsOptions: {
        type: "dots",
      },
    },
  },
  {
    id: "rounded",
    options: {
      dotsOptions: {
        type: "rounded",
      },
    },
  },
  {
    id: "classy",
    options: {
      dotsOptions: {
        type: "classy",
      },
    },
  },
  {
    id: "classy-rounded",
    options: {
      dotsOptions: {
        type: "classy-rounded",
      },
    },
  },
  {
    id: "extra-rounded",
    options: {
      dotsOptions: {
        type: "extra-rounded",
      },
    },
  },
];

const eyeFrameStyles = [
  {
    id: "square",
    options: {
      cornersSquareOptions: {
        type: "square",
      },
    },
  },
  {
    id: "dot",
    options: {
      cornersSquareOptions: {
        type: "dot",
      },
    },
  },
  {
    id: "extra-rounded",
    options: {
      cornersSquareOptions: {
        type: "extra-rounded",
      },
    },
  },
];

const eyeBallStyles = [
  {
    id: "square",
    options: {
      cornersDotOptions: {
        type: "square",
      },
    },
  },
  {
    id: "dot",
    options: {
      cornersDotOptions: {
        type: "dot",
      },
    },
  },
  {
    id: "extra-rounded",
    options: {
      cornersDotOptions: {
        type: "extra-rounded",
      },
    },
  },
];
const QRGenerator = () => {
  const { auth } = useAuth();
  const [qrType, setQrType] = useState("registration"); // registration | activity
  const [activityType, setActivityType] = useState("quiz"); // quiz | spinwheel | scratchcard
  const [activities, setActivities] = useState({
    quiz: [],
    spinwheel: [],
    scratchcard: [],
  });
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [loading, setLoading] = useState(false);
  const [retailerId] = useState(localStorage.getItem("retailerId") || "");
  const [includePreferences, setIncludePreferences] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]); // [{key, question, section}]
  const [categorizedPreferences, setCategorizedPreferences] = useState({
    additionalData: [],
    advancedDetails: [],
    advancedPrivacyDetails: [],
  });
  const [isPreferenceDropdownOpen, setIsPreferenceDropdownOpen] = useState([]);
  const [qrStatement, setQrStatement] = useState("");
  const [isDynamic, setIsDynamic] = useState(false);
  const [qrName, setQrName] = useState("");
  const [savedQRs, setSavedQRs] = useState([]);
  const [selectedDynamicQR, setSelectedDynamicQR] = useState(null);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [cardBgColor, setCardBgColor] = useState("#ffffff");

  const [tempFgColor, setTempFgColor] = useState(fgColor);
  const [tempBgColor, setTempBgColor] = useState(bgColor);
  const [tempCardBgColor, setTempCardBgColor] = useState(cardBgColor);
  const [brandingName, setBrandingName] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoSize, setLogoSize] = useState(40);
  const [logoPlacement, setLogoPlacement] = useState("top"); // top | inside
  const [qrSubtitle, setQrSubtitle] = useState("");
  const [resolvedLogo, setResolvedLogo] = useState(null);
  const previewRef = useRef(null);
  // QR body style
  const [qrStyle, setQrStyle] = useState("square");

  const [eyeFrame, setEyeFrame] = useState("square");

  const [eyeBall, setEyeBall] = useState("square");

  const [titleColor, setTitleColor] = useState("#1F2937");
  const [subtitleColor, setSubtitleColor] = useState("#9CA3AF");
  const [statementColor, setStatementColor] = useState("#374151");

  const [tempTitleColor, setTempTitleColor] = useState(titleColor);
  const [tempSubtitleColor, setTempSubtitleColor] = useState(subtitleColor);
  const [tempStatementColor, setTempStatementColor] = useState(statementColor);

  // Accordion Sections Open State
  const [openSections, setOpenSections] = useState({
    type: true,
    customization: false,
    activity: false,
    styling: false,
    saveManage: false,
  });

  // Saved QRs Filter & Search State
  const [savedSearchQuery, setSavedSearchQuery] = useState("");
  const [savedFilterType, setSavedFilterType] = useState("all");

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResetNewQR = () => {
    setSelectedDynamicQR(null);
    setIsDynamic(false);
    setQrName("");
    setBrandingName("");
    setLogo(null);
    setResolvedLogo(null);
    setQrStatement("");
    setIncludePreferences(false);
    setSelectedPreferences([]);
    setQrSubtitle("");
    setFgColor("#000000");
    setBgColor("#ffffff");
    setCardBgColor("#ffffff");
    setTempFgColor("#000000");
    setTempBgColor("#ffffff");
    setTempCardBgColor("#ffffff");
    setQrStyle("square");
    setEyeFrame("square");
    setEyeBall("square");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleColor(tempTitleColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempTitleColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubtitleColor(tempSubtitleColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempSubtitleColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatementColor(tempStatementColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempStatementColor]);

  // Eye frame
  const [eyeRadius, setEyeRadius] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  // Eye ball
  const [eyeInnerRadius, setEyeInnerRadius] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFgColor(tempFgColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempFgColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBgColor(tempBgColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempBgColor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCardBgColor(tempCardBgColor);
    }, 120);

    return () => clearTimeout(timer);
  }, [tempCardBgColor]);

  // Set default branding and logo from retailer info
  useEffect(() => {
    if (auth?.user && !selectedDynamicQR) {
      if (!brandingName) setBrandingName(auth.user.storeName || "");
      if (!logo) setLogo(auth.user.storeImage || null);
    }
  }, [auth, selectedDynamicQR]);

  const landingPageBaseUrl = "https://vadik.ai"; // Adjust as needed
const MAX_QR_LIMIT = 5;

const canCreateMoreQR = () => {
  if (savedQRs.length >= MAX_QR_LIMIT) {
    showToast("You can only create up to 5 QR codes.");
    return false;
  }
  return true;
};
  useEffect(() => {
    fetchActivities();
    fetchSavedQRs();
    fetchAvailablePreferences();
  }, []);

  useEffect(() => {
    let ignore = false;

    const resolveLogo = async () => {
      if (!logo) {
        setResolvedLogo(null);
        return;
      }

      if (logo.startsWith("data:") || logo.startsWith("blob:")) {
        setResolvedLogo(logo);
        return;
      }

      try {
        const response = await api.get("/api/dynamic-qr/logo-data", {
          params: { url: logo },
        });

        if (!ignore) {
          setResolvedLogo(response.data?.data || logo);
        }
      } catch (error) {
        console.error("Error resolving QR logo:", error);
        if (!ignore) {
          setResolvedLogo(logo);
        }
      }
    };

    resolveLogo();

    return () => {
      ignore = true;
    };
  }, [logo]);

  const fetchAvailablePreferences = async () => {
    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`);
      if (response.data) {
        setCategorizedPreferences({
          additionalData: response.data.additionalData || [],
          advancedDetails: response.data.advancedDetails || [],
          advancedPrivacyDetails: response.data.advancedPrivacyDetails || [],
        });
      }
    } catch (error) {
      console.error("Error fetching available preferences:", error);
    }
  };

  const fetchSavedQRs = async () => {
    try {
      const response = await api.get("/api/dynamic-qr/my-qrs");
      if (response.data.status) {
        setSavedQRs(
          (response.data.data || []).map((qr) => ({
            ...qr,
            selectedPreferences: Array.isArray(qr.selectedPreferences)
              ? qr.selectedPreferences.map(normalizePreferenceItem)
              : [],
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching saved QRs:", error);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file format
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showToast(
          "Unsupported image format. Please upload a JPG, JPEG, PNG, or WebP file.",
          "error",
        );
        e.target.value = "";
        return;
      }

      const MAX_SIZE = 1 * 1024 * 1024; // 1MB
      if (file.size > MAX_SIZE) {
        showToast(
          "Image size exceeds the maximum allowed limit. Please upload an image within the permitted size.",
          "error",
        );
        e.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        setResolvedLogo(reader.result);
      };
      reader.onerror = () => {
        showToast(
          "Image upload failed. Please verify the file and try again.",
          "error",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQR = async () => {
      if (!canCreateMoreQR()) return;
    if (!qrName || qrName.trim().length < 3) {
      showToast("Please enter a valid QR name (min 3 characters)", "error");
      return;
    }

    if (qrName.length > 50) {
      showToast("QR name is too long (max 50 characters)", "error");
      return;
    }

    if (qrType === "activity" && !selectedActivityId) {
      showToast("Please select an activity for this QR type", "error");
      return;
    }

    if (
      brandingName &&
      (brandingName.trim().length < 2 || brandingName.length > 50)
    ) {
      showToast("Branding name must be between 2 and 50 characters", "error");
      return;
    }

    if (qrSubtitle && qrSubtitle.length > 100) {
      showToast("Branding subtitle must be less than 100 characters", "error");
      return;
    }

    if (qrStatement && qrStatement.length > 100) {
      showToast("Static statement must be less than 100 characters", "error");
      return;
    }

    if (includePreferences) {
      const invalid = selectedPreferences.some((p) => !p.key || !p.question);
      if (invalid) {
        showToast(
          "Please complete all preference fields and questions",
          "error",
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: qrName,
        type: qrType,
        activityType: qrType === "activity" ? activityType : "none",
        activityId: qrType === "activity" ? selectedActivityId : "",
        includePreferences,
        selectedPreferences: includePreferences ? selectedPreferences : [],
        qrStatement,
        fgColor,
        bgColor,
        brandingName,
         titleColor,
  subtitleColor,
  statementColor,
        logo,
        logoSize,
        logoOpacity,
        logoPlacement,
        qrSubtitle,
        cardBgColor,
        qrStyle: normalizeQrStyle({
          bodyShape: qrStyle,
          eyeFrame,
          eyeBall,
        }),
      };

      let response;
      if (selectedDynamicQR) {
      
        response = await api.patch(
          `/api/dynamic-qr/${selectedDynamicQR._id}`,
          payload,
        );
        showToast("QR updated successfully!", "success");
      } else {
        response = await api.post("/api/dynamic-qr", payload);
        showToast("QR created successfully!", "success");
      }
 
      if (response.data.status) {
        fetchSavedQRs();
        setSelectedDynamicQR(response.data.data);
        setIsDynamic(true);
      }
    } catch (error) {

      const errorMsg =
        error.response?.data?.message || "Failed to save QR. Please try again.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDynamicQR = (qr) => {
    setSelectedDynamicQR(qr);
    setQrName(qr.name);
    setQrType(qr.type);
    if (qr.type === "activity") {
      setActivityType(qr.activityType);
      setSelectedActivityId(qr.activityId);
    }
    setIncludePreferences(qr.includePreferences);
    setSelectedPreferences(
      Array.isArray(qr.selectedPreferences)
        ? qr.selectedPreferences.map(normalizePreferenceItem)
        : [],
    );
    setQrStatement(qr.qrStatement || "");
    setFgColor(qr.fgColor || "#000000");
    setBgColor(qr.bgColor || "#ffffff");
    setBrandingName(qr.brandingName || "");
    setTitleColor(qr.titleColor || "#1F2937");
setSubtitleColor(qr.subtitleColor || "#9CA3AF");
setStatementColor(qr.statementColor || "#374151");

setTempTitleColor(qr.titleColor || "#1F2937");
setTempSubtitleColor(qr.subtitleColor || "#9CA3AF");
setTempStatementColor(qr.statementColor || "#374151");
    setLogo(qr.logo || null);
    setLogoSize(Math.min(qr.logoSize || 40, 80));
    setLogoOpacity(qr.logoOpacity || 1);
    setLogoPlacement(qr.logoPlacement || "top");
    setQrSubtitle(qr.qrSubtitle || "");
    setCardBgColor(qr.cardBgColor || "#ffffff");
    const normalizedStyle = normalizeQrStyle(qr.qrStyle);
    setQrStyle(normalizedStyle.bodyShape);
    setEyeFrame(normalizedStyle.eyeFrame);
    setEyeBall(normalizedStyle.eyeBall);
    setIsDynamic(true);
    setIsPreferenceDropdownOpen(
      new Array(qr.selectedPreferences?.length || 0).fill(false),
    );
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [quizRes, spinRes, scratchRes] = await Promise.all([
        api.get("/api/quiz?fully=true"),
        api.get("/api/spinWheels/spinWheel/all?fully=true"),
        api.get("/api/scratchCards/scratchCard/all?fully=true"),
      ]);

      setActivities({
        quiz: quizRes.data.docs || [],
        spinwheel: spinRes.data.data || [],
        scratchcard: scratchRes.data.data || [],
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Failed to load activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const addPreferenceQuestion = () => {
    setSelectedPreferences([
      ...selectedPreferences,
      { key: "", question: "", section: "" },
    ]);
    setIsPreferenceDropdownOpen([...isPreferenceDropdownOpen, false]);
  };

  const removePreferenceQuestion = (index) => {
    const updated = selectedPreferences.filter((_, i) => i !== index);
    setSelectedPreferences(updated);
    const updatedDropdowns = isPreferenceDropdownOpen.filter(
      (_, i) => i !== index,
    );
    setIsPreferenceDropdownOpen(updatedDropdowns);
  };

  const togglePreferenceDropdown = (index) => {
    const updated = [...isPreferenceDropdownOpen];
    updated[index] = !updated[index];
    setIsPreferenceDropdownOpen(updated);
  };

  const handlePreferenceKeyChange = (index, key, section) => {
    const sectionFields = categorizedPreferences[section];
    const selectedPref = sectionFields.find((p) => p.key === key);

    if (selectedPref) {
      const updated = [...selectedPreferences];
      updated[index] = {
        key: selectedPref.key,
        section: section,
        question:
          selectedPref.type === "date"
            ? `When is your ${selectedPref.key}?`
            : `What is your ${selectedPref.key}?`,
      };
      setSelectedPreferences(updated);
    }
  };

  const handlePreferenceQuestionChange = (index, value) => {
    const updated = [...selectedPreferences];
    updated[index].question = value;
    setSelectedPreferences(updated);
  };

  const getGeneratedUrl = () => {
    if (isDynamic && selectedDynamicQR) {
      return `${landingPageBaseUrl}/q/${selectedDynamicQR.qrId}`;
    }

    let baseUrl = "";
    if (qrType === "registration") {
      baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}`;
    } else {
      if (!selectedActivityId) return "";
      baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}?activityType=${activityType}&activityId=${selectedActivityId}`;
    }

    if (includePreferences) {
      baseUrl +=
        (baseUrl.includes("?") ? "&" : "?") + "includePreferences=true";
      if (selectedPreferences.length > 0) {
        baseUrl += `&prefFields=${encodeURIComponent(JSON.stringify(selectedPreferences))}`;
      }
    }
    return baseUrl;
  };

  const generatedUrl = getGeneratedUrl();
  const hasSavedDynamicQR = Boolean(isDynamic && selectedDynamicQR?.qrId);
  const effectiveLogo = resolvedLogo || logo;
  const selectedQrStyle = normalizeQrStyle({
    bodyShape: qrStyle,
    eyeFrame,
    eyeBall,
  });

  const generateQRCanvas = async () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return null;
    try {
      const svgClone = svg.cloneNode(true);
      const canRenderLogoInCanvas = canUseLogoInCanvas(effectiveLogo);

      if (!canRenderLogoInCanvas) {
        svgClone
          .querySelectorAll("image")
          .forEach((imageNode) => imageNode.remove());
      }

      const svgData = new XMLSerializer().serializeToString(svgClone);
      const qrImage = await loadImage(
        `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgData)))}`,
      );
      const topLogoImage =
        effectiveLogo && logoPlacement === "top" && canRenderLogoInCanvas
          ? await loadImage(effectiveLogo)
          : null;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const cardWidth = 720;
      const contentPaddingX = 60;
      const contentWidth = cardWidth - contentPaddingX * 2;
      const qrSize = 400;
      const borderRadius = 24;

      const brandFontSize = 36;
      const subtitleFontSize = 20;
      const statementFontSize = 24;

      const titleLineHeight = Math.round(brandFontSize * 1.2);
      const subtitleLineHeight = Math.round(subtitleFontSize * 1.3);
      const statementLineHeight = Math.round(statementFontSize * 1.4);

      ctx.font = `700 ${brandFontSize}px Inter, system-ui, sans-serif`;
      const brandMeasure = measureWrappedText(
        ctx,
        brandingName,
        contentWidth,
        titleLineHeight,
      );

      ctx.font = `500 ${subtitleFontSize}px Inter, system-ui, sans-serif`;
      const subtitleMeasure = measureWrappedText(
        ctx,
        qrSubtitle,
        contentWidth,
        subtitleLineHeight,
      );

      ctx.font = `600 ${statementFontSize}px Inter, system-ui, sans-serif`;
      const statementMeasure = measureWrappedText(
        ctx,
        qrStatement,
        contentWidth,
        statementLineHeight,
      );

      const hasHeader = Boolean(brandingName || topLogoImage || qrSubtitle);
      const headerHeight = hasHeader
        ? (topLogoImage ? logoSize * 2 : 0) +
        (brandingName ? brandMeasure.height + 10 : 0) +
        (qrSubtitle ? subtitleMeasure.height + 10 : 0) +
        20
        : 0;

      const footerHeight = qrStatement ? statementMeasure.height + 40 : 0;

      canvas.width = cardWidth;
      canvas.height = 80 + headerHeight + qrSize + 40 + footerHeight + 60;
      const cardHeight = canvas.height;

      // Background
      ctx.fillStyle = cardBgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, cardWidth, cardHeight, borderRadius);
      ctx.fill();

      // Border
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 2;
      ctx.stroke();

      let currentY = 80;

      if (hasHeader) {
        if (topLogoImage) {
          const logoDispSize = logoSize * 2;
          ctx.save();
          ctx.globalAlpha = logoOpacity;
          ctx.drawImage(
            topLogoImage,
            (cardWidth - logoDispSize) / 2,
            currentY,
            logoDispSize,
            logoDispSize,
          );
          ctx.restore();
          currentY += logoDispSize + 25;
        }

        if (brandingName) {
          ctx.fillStyle = "#1e293b";
          ctx.font = `700 ${brandFontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          drawWrappedText(
            ctx,
            brandMeasure.lines,
            cardWidth / 2,
            currentY + brandFontSize,
            titleLineHeight,
          );
          currentY += brandMeasure.height + 15;
        }

        if (qrSubtitle) {
          ctx.fillStyle = "#64748b";
          ctx.font = `500 ${subtitleFontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          drawWrappedText(
            ctx,
            subtitleMeasure.lines,
            cardWidth / 2,
            currentY + subtitleFontSize,
            subtitleLineHeight,
          );
          currentY += subtitleMeasure.height + 15;
        }

        currentY += 10;
      }

      // QR Code
      const qrX = (cardWidth - qrSize) / 2;
      ctx.drawImage(qrImage, qrX, currentY, qrSize, qrSize);
      currentY += qrSize + 30;

      if (qrStatement) {
        ctx.fillStyle = "#475569";
        ctx.font = `600 ${statementFontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        drawWrappedText(
          ctx,
          statementMeasure.lines,
          cardWidth / 2,
          currentY + statementFontSize,
          statementLineHeight,
        );
      }

      return canvas;
    } catch (error) {
      console.error("Error generating QR canvas:", error);
      return null;
    }
  };

  const downloadQR = async () => {
    if (!previewRef.current) return;

    if (!hasSavedDynamicQR) {
      showToast("Save the registration coupon before downloading the QR.", "error");
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 4,
        backgroundColor: cardBgColor,
      });

      const link = document.createElement("a");
      link.download = `QR_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      showToast("Unable to download QR", "error");
    }
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;

    if (!hasSavedDynamicQR) {
      showToast("Save the registration coupon before downloading the QR.", "error");
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 4,
        cacheBust: true,
        backgroundColor: cardBgColor,
      });

      // Create an image to determine dimensions
      const img = new Image();
      img.src = dataUrl;

      img.onload = () => {
        const pdf = new jsPDF({
          orientation: img.width > img.height ? "landscape" : "portrait",
          unit: "px",
          format: [img.width, img.height],
        });

        pdf.addImage(
          dataUrl,
          "PNG",
          0,
          0,
          img.width,
          img.height,
          undefined,
          "FAST",
        );

        pdf.save(`QR_${Date.now()}.pdf`);
      };
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast("Could not prepare PDF download", "error");
    }
  };

  const copyToClipboard = () => {
    if (!hasSavedDynamicQR) {
      showToast("Save the registration coupon before copying the QR link.", "error");
      return;
    }

    navigator.clipboard.writeText(generatedUrl);
    showToast("URL copied to clipboard!", "success");
  };

  const handleQrTypeChange = (type) => {
    setQrType(type);
    if (type === "activity") {
      setIncludePreferences(false);
    }
  };

  const getSavedQrUrl = (qr) => `${landingPageBaseUrl}/q/${qr.qrId}`;



  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-2xl">
              <QrCode className="w-7 h-7 text-indigo-600" />
            </div>
            QR Module
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Generate customizable QR codes for customer registration and
            interactive activities.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-5">

            {/* Quick Navigation Jump Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                type="button"
                onClick={() => toggleSection("type")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${openSections.type
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                1. Type
              </button>
              <button
                type="button"
                onClick={() => toggleSection("customization")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${openSections.customization
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                2. Customize
              </button>
              {qrType === "activity" && (
                <button
                  type="button"
                  onClick={() => toggleSection("activity")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${openSections.activity
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  3. Activity
                </button>
              )}
              <button
                type="button"
                onClick={() => toggleSection("styling")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${openSections.styling
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <Palette className="w-3.5 h-3.5" />
                {qrType === "activity" ? "4. Styling" : "3. Styling"}
              </button>
              <button
                type="button"
                onClick={() => toggleSection("saveManage")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${openSections.saveManage
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {qrType === "activity" ? "5. Save & Manage" : "4. Save & Manage"}
                {savedQRs.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${openSections.saveManage ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                    {savedQRs.length}
                  </span>
                )}
              </button>

              <div className="ml-auto flex items-center gap-2 shrink-0 pl-2">
                <button
                  type="button"
                  onClick={() => setOpenSections({ type: true, customization: true, activity: true, styling: true, saveManage: true })}
                  className="text-[11px] text-indigo-600 hover:underline font-medium"
                >
                  Expand All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => setOpenSections({ type: false, customization: false, activity: false, styling: false, saveManage: false })}
                  className="text-[11px] text-gray-500 hover:underline font-medium"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Card 1: QR Type Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
              <div
                onClick={() => toggleSection("type")}
                className="p-5 md:p-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-xs">
                    1
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      Select QR Type
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      {qrType === "registration" ? "Customer Registration Form" : "Interactive Customer Activity"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-block">
                    {qrType === "registration" ? "Registration" : "Activity"}
                  </span>
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    {openSections.type ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {openSections.type && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-50 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <button
                      onClick={() => handleQrTypeChange("registration")}
                      className={`group flex flex-col items-start p-4 rounded-xl border transition-all ${qrType === "registration"
                          ? "border-indigo-300 bg-indigo-50/30 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                    >
                      <div
                        className={`p-2 rounded-xl mb-3 ${qrType === "registration"
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-400 group-hover:text-gray-500"
                          }`}
                      >
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-semibold ${qrType === "registration" ? "text-indigo-700" : "text-gray-700"}`}
                      >
                        Customer Registration
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Direct customers to your sign-up page
                      </span>
                    </button>

                    <button
                      onClick={() => handleQrTypeChange("activity")}
                      className={`group flex flex-col items-start p-4 rounded-xl border transition-all ${qrType === "activity"
                          ? "border-rose-300 bg-rose-50/30 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                    >
                      <div
                        className={`p-2 rounded-xl mb-3 ${qrType === "activity"
                            ? "bg-rose-100 text-rose-500"
                            : "bg-gray-100 text-gray-400 group-hover:text-gray-500"
                          }`}
                      >
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <span
                        className={`font-semibold ${qrType === "activity" ? "text-rose-600" : "text-gray-700"}`}
                      >
                        Customer Activity
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Redirect to games or quizzes
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Customization Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
              <div
                onClick={() => toggleSection("customization")}
                className="p-5 md:p-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-xs">
                    2
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      Customize Options
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Body shapes, eye frames, eye balls & statement text
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-block">
                    {qrStyle} • {eyeFrame}
                  </span>
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    {openSections.customization ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {openSections.customization && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-50 animate-in fade-in duration-200">
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">Body Shape</h4>
                    <div className="flex gap-4 flex-wrap">
                      {bodyStyles.map((item) => (
                        <QRStyleOption
                          key={item.id}
                          options={item.options}
                          selected={qrStyle === item.id}
                          onClick={() => setQrStyle(item.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">Eye Frame</h4>
                    <div className="flex gap-4 flex-wrap">
                      {eyeFrameStyles.map((item) => (
                        <QRStyleOption
                          key={item.id}
                          options={item.options}
                          selected={eyeFrame === item.id}
                          onClick={() => setEyeFrame(item.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3 text-sm text-gray-700">Eye Ball</h4>
                    <div className="flex gap-4 flex-wrap">
                      {eyeBallStyles.map((item) => (
                        <QRStyleOption
                          key={item.id}
                          options={item.options}
                          selected={eyeBall === item.id}
                          onClick={() => setEyeBall(item.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 pt-4 border-t border-gray-100">
                    {qrType === "registration" && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                      </div>
                    )}

                    {qrType === "registration" && includePreferences && (
                      <div className="space-y-5 animate-in fade-in slide-in-from-top-4">
                        {selectedPreferences.map((item, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-xl border border-gray-200 p-5 relative group shadow-sm"
                          >
                            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                              <h3 className="text-md font-semibold text-gray-700">
                                Question {index + 1}
                              </h3>

                              <div className="flex items-center gap-3">
                                <div className="relative w-64">
                                  <button
                                    type="button"
                                    onClick={() => togglePreferenceDropdown(index)}
                                    className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                                  >
                                    <span className="truncate text-gray-600">
                                      {item.key
                                        ? formatPreferenceSection(item.section)
                                          ? `${item.key} (${formatPreferenceSection(item.section)})`
                                          : item.key
                                        : "Select Field"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  </button>

                                  {isPreferenceDropdownOpen[index] && (
                                    <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                                      {categorizedPreferences.additionalData
                                        .length > 0 && (
                                          <div className="p-2">
                                            <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                              <Database className="w-3 h-3" />{" "}
                                              Additional Data
                                            </div>
                                            {categorizedPreferences.additionalData.map(
                                              (pref) => (
                                                <button
                                                  key={pref.key}
                                                  type="button"
                                                  onClick={() => {
                                                    handlePreferenceKeyChange(
                                                      index,
                                                      pref.key,
                                                      "additionalData",
                                                    );
                                                    togglePreferenceDropdown(index);
                                                  }}
                                                  className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                                >
                                                  <span className="text-gray-700">
                                                    {pref.key}
                                                  </span>
                                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">
                                                    {pref.type}
                                                  </span>
                                                </button>
                                              ),
                                            )}
                                          </div>
                                        )}

                                      {categorizedPreferences.advancedDetails
                                        .length > 0 && (
                                          <div className="p-2 bg-gray-50/50">
                                            <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                              <LayoutDashboard className="w-3 h-3" />{" "}
                                              Advanced Details
                                            </div>
                                            {categorizedPreferences.advancedDetails.map(
                                              (pref) => (
                                                <button
                                                  key={pref.key}
                                                  type="button"
                                                  onClick={() => {
                                                    handlePreferenceKeyChange(
                                                      index,
                                                      pref.key,
                                                      "advancedDetails",
                                                    );
                                                    togglePreferenceDropdown(index);
                                                  }}
                                                  className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                                >
                                                  <span className="text-gray-700">
                                                    {pref.key}
                                                  </span>
                                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">
                                                    {pref.type}
                                                  </span>
                                                </button>
                                              ),
                                            )}
                                          </div>
                                        )}

                                      {categorizedPreferences.advancedPrivacyDetails
                                        .length > 0 && (
                                          <div className="p-2">
                                            <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                              <ShieldCheck className="w-3 h-3" />{" "}
                                              Privacy Details
                                            </div>
                                            {categorizedPreferences.advancedPrivacyDetails.map(
                                              (pref) => (
                                                <button
                                                  key={pref.key}
                                                  type="button"
                                                  onClick={() => {
                                                    handlePreferenceKeyChange(
                                                      index,
                                                      pref.key,
                                                      "advancedPrivacyDetails",
                                                    );
                                                    togglePreferenceDropdown(index);
                                                  }}
                                                  className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                                >
                                                  <span className="text-gray-700">
                                                    {pref.key}
                                                  </span>
                                                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">
                                                    {pref.type}
                                                  </span>
                                                </button>
                                              ),
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removePreferenceQuestion(index)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={item.question}
                                onChange={(e) =>
                                  handlePreferenceQuestionChange(
                                    index,
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter your display question"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700 text-sm"
                              />
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addPreferenceQuestion}
                          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add New Question
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Static Statement on QR Image
                        </label>
                        <p className="text-[11px] text-gray-400 mb-2">
                          Displayed below QR code (max 100 chars)
                        </p>
                        <input
                          type="text"
                          value={qrStatement}
                          onChange={(e) => setQrStatement(e.target.value)}
                          maxLength={100}
                          placeholder="E.g., Scan to earn rewards"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Statement Text Color
                        </label>
                        <p className="text-[11px] text-gray-400 mb-2">
                          Choose color for statement text
                        </p>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <input
                            type="color"
                            value={tempStatementColor}
                            onChange={(e) => setTempStatementColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono text-gray-600">{tempStatementColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3: Activity Details (Conditional) */}
            {qrType === "activity" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
                <div
                  onClick={() => toggleSection("activity")}
                  className="p-5 md:p-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold shadow-xs">
                      3
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        Activity Details
                      </h2>
                      <p className="text-xs text-gray-400 font-medium">
                        Select interactive campaign (Quiz, Spin Wheel, Scratch Card)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 hidden sm:inline-block capitalize">
                      {activityType}
                    </span>
                    <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                      {openSections.activity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {openSections.activity && (
                  <div className="p-5 md:p-6 pt-0 border-t border-gray-50 animate-in fade-in duration-200">
                    <div className="space-y-5 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Activity Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {["quiz", "spinwheel", "scratchcard"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setActivityType(type);
                                setSelectedActivityId("");
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activityType === type
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose {activityType}
                        </label>
                        <select
                          value={selectedActivityId}
                          onChange={(e) => setSelectedActivityId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700 text-sm"
                        >
                          <option value="">Select an activity</option>
                          {activities[activityType]?.map((act) => (
                            <option key={act._id} value={act._id}>
                              {act.name || act.campaignName || "Untitled Activity"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card 4: Styling & Branding */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md overflow-hidden">
              <div
                onClick={() => toggleSection("styling")}
                className="p-5 md:p-6 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-xs">
                    {qrType === "activity" ? 4 : 3}
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      Styling & Branding
                    </h2>
                    <p className="text-xs text-gray-400 font-medium">
                      Branding titles, color scheme, logo upload & positioning
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 hidden sm:inline-block truncate max-w-[120px]">
                    {brandingName || "Custom Colors"}
                  </span>
                  <button type="button" className="p-1 text-gray-400 hover:text-gray-600">
                    {openSections.styling ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {openSections.styling && (
                <div className="p-5 md:p-6 pt-0 border-t border-gray-50 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branding Name
                        </label>
                        <p className="text-[11px] text-gray-500 mb-2">
                          Display name for your QR (2-50 chars)
                        </p>
                        <input
                          type="text"
                          value={brandingName}
                          onChange={(e) => setBrandingName(e.target.value)}
                          maxLength={50}
                          placeholder="Your brand name"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Branding Subtitle
                        </label>
                        <p className="text-[11px] text-gray-500 mb-2">
                          Optional tagline (max 100 chars)
                        </p>
                        <input
                          type="text"
                          value={qrSubtitle}
                          onChange={(e) => setQrSubtitle(e.target.value)}
                          maxLength={100}
                          placeholder="E.g., Your tagline or business type"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-sm"
                        />
                      </div>

                      <div className="pt-2">
                        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                          Text Colors
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Branding Title
                            </label>
                            <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                              <input
                                type="color"
                                value={tempTitleColor}
                                onChange={(e) => setTempTitleColor(e.target.value)}
                                className="w-7 h-7 cursor-pointer border-0 rounded"
                              />
                              <span className="text-xs font-mono text-gray-600">{tempTitleColor}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Subtitle
                            </label>
                            <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
                              <input
                                type="color"
                                value={tempSubtitleColor}
                                onChange={(e) => setTempSubtitleColor(e.target.value)}
                                className="w-7 h-7 cursor-pointer border-0 rounded"
                              />
                              <span className="text-xs font-mono text-gray-600">{tempSubtitleColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                          QR Colors
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 mb-1">
                              QR Color
                            </label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                              <input
                                type="color"
                                value={tempFgColor}
                                onChange={(e) => setTempFgColor(e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border-0"
                              />
                              <span className="text-[10px] font-mono text-gray-600 truncate">{tempFgColor}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 mb-1">
                              Background
                            </label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                              <input
                                type="color"
                                value={tempBgColor}
                                onChange={(e) => setTempBgColor(e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border-0"
                              />
                              <span className="text-[10px] font-mono text-gray-600 truncate">{tempBgColor}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 mb-1">
                              Card Bg
                            </label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                              <input
                                type="color"
                                value={tempCardBgColor}
                                onChange={(e) => setTempCardBgColor(e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border-0"
                              />
                              <span className="text-[10px] font-mono text-gray-600 truncate">{tempCardBgColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Logo
                        </label>
                        <p className="text-[11px] text-gray-500 mb-2">
                          Maximum size 1MB. PNG or JPG recommended.
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label
                              htmlFor="logo-upload"
                              className="flex items-center justify-center px-4 py-2.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-gray-500 text-sm font-medium gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              {logo ? "Change Logo" : "Choose File"}
                            </label>
                          </div>
                          {logo && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogo(null);
                                setResolvedLogo(null);
                              }}
                              className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {logo && (
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Size ({logoSize}px)
                              </label>
                              <input
                                type="range"
                                min="20"
                                max="80"
                                value={logoSize}
                                onChange={(e) =>
                                  setLogoSize(parseInt(e.target.value))
                                }
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                            {logoPlacement === "top" && (
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                  Opacity ({logoOpacity})
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={logoOpacity}
                                  onChange={(e) =>
                                    setLogoOpacity(parseFloat(e.target.value))
                                  }
                                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">
                              Logo Placement
                            </label>
                            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-lg">
                              <button
                                type="button"
                                onClick={() => setLogoPlacement("top")}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${logoPlacement === "top"
                                    ? "bg-white text-indigo-600 shadow-sm font-bold"
                                    : "text-gray-500 hover:text-gray-700"
                                  }`}
                              >
                                Top of Card
                              </button>
                              <button
                                type="button"
                                onClick={() => setLogoPlacement("inside")}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${logoPlacement === "inside"
                                    ? "bg-white text-indigo-600 shadow-sm font-bold"
                                    : "text-gray-500 hover:text-gray-700"
                                  }`}
                              >
                                Inside QR
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card 5: Save & Manage (Revamped Unique UI!) */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl border border-indigo-800/60 shadow-xl transition-all overflow-hidden text-white">
              {/* Accordion Header */}
              <div
                onClick={() => toggleSection("saveManage")}
                className="p-5 md:p-6 flex items-center justify-between cursor-pointer select-none bg-indigo-950/80 hover:bg-indigo-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center text-sm font-bold shadow-xs">
                    {qrType === "activity" ? 5 : 4}
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Save & Manage
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                        {savedQRs.length} Saved
                      </span>
                    </h2>
                    <p className="text-xs text-indigo-200/70 font-medium">
                      Manage your saved dynamic QRs, search library & update configurations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-800/60 text-indigo-200 border border-indigo-700/60 hidden sm:inline-block">
                    {selectedDynamicQR ? `Editing: ${selectedDynamicQR.name}` : "New QR Draft"}
                  </span>
                  <button type="button" className="p-1 text-indigo-300 hover:text-white">
                    {openSections.saveManage ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {openSections.saveManage && (
                <div className="p-5 md:p-6 pt-0 border-t border-indigo-800/50 animate-in fade-in duration-200 space-y-6">
                  {/* Mode Banner & Quick Action */}
                  <div className="pt-4">
                    {selectedDynamicQR ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-indigo-900/50 border border-indigo-700/60 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
                          <div>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                              Active Editor Mode
                            </p>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              {selectedDynamicQR.name}
                              <span className="text-[10px] px-2 py-0.5 bg-indigo-800/80 text-indigo-200 rounded font-mono">
                                {selectedDynamicQR.qrId}
                              </span>
                            </h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetNewQR}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-200 hover:text-white bg-indigo-800/80 hover:bg-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-600/50 shadow-sm transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset & Create New
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-emerald-950/40 border border-emerald-800/50 rounded-xl">
                        <div className="flex items-center gap-2.5">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <div>
                            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                              Dynamic Builder
                            </p>
                            <h4 className="text-sm font-bold text-white">Creating New QR Configuration</h4>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-800/60 text-emerald-200 rounded-full border border-emerald-600/40">
                          Unsaved Draft
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Save/Update Action Box */}
                  <div className="p-4 bg-indigo-900/30 border border-indigo-700/40 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-indigo-200 uppercase tracking-wider">
                      {selectedDynamicQR ? "Update Saved QR Name" : "Save as New Dynamic QR"}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={qrName}
                        onChange={(e) => setQrName(e.target.value)}
                        placeholder="Enter descriptive name for this QR code..."
                        className="flex-1 px-4 py-2.5 bg-slate-950/70 border border-indigo-700/60 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-white text-sm placeholder-indigo-300/40"
                      />
                      <button
                        type="button"
                        onClick={handleSaveQR}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 text-sm"
                      >
                        <Bookmark className="w-4 h-4" />
                        {selectedDynamicQR ? "Update QR" : "Save QR"}
                      </button>
                    </div>
                  </div>

                  {/* Saved QRs Library */}
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">Your Saved QR Library</h3>
                      </div>

                      {/* Search Bar */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                        <input
                          type="text"
                          value={savedSearchQuery}
                          onChange={(e) => setSavedSearchQuery(e.target.value)}
                          placeholder="Search QRs..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-indigo-700/50 rounded-lg text-xs text-white placeholder-indigo-400/40 focus:outline-none focus:border-indigo-500"
                        />
                        {savedSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setSavedSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                      {[
                        { id: "all", label: "All QRs", count: savedQRs.length },
                        { id: "registration", label: "Registration", count: savedQRs.filter((q) => q.type === "registration").length },
                        { id: "activity", label: "Activity", count: savedQRs.filter((q) => q.type === "activity").length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSavedFilterType(tab.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${savedFilterType === tab.id
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-indigo-900/40 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-800/50"
                            }`}
                        >
                          {tab.label}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${savedFilterType === tab.id ? "bg-white/20 text-white" : "bg-indigo-950 text-indigo-400"
                            }`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Saved QRs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar pt-1">
                      {/* Create New Card */}
                      <div
                        onClick={handleResetNewQR}
                        className={`group p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[90px] ${!selectedDynamicQR
                            ? "border-indigo-400/80 bg-indigo-900/40"
                            : "border-indigo-800/50 bg-indigo-950/40 hover:border-indigo-600 hover:bg-indigo-900/30"
                          }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${!selectedDynamicQR
                              ? "bg-indigo-500 text-white"
                              : "bg-indigo-900 text-indigo-400 group-hover:bg-indigo-700 group-hover:text-white"
                            }`}
                        >
                          <Plus className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-bold ${!selectedDynamicQR ? "text-indigo-200" : "text-indigo-400 group-hover:text-indigo-200"}`}
                        >
                          Create New QR
                        </span>
                      </div>

                      {savedQRs
                        .filter((qr) => {
                          const matchesType =
                            savedFilterType === "all" ? true : qr.type === savedFilterType;
                          const matchesSearch =
                            !savedSearchQuery ||
                            qr.name?.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
                            qr.qrId?.toLowerCase().includes(savedSearchQuery.toLowerCase());
                          return matchesType && matchesSearch;
                        })
                        .map((qr) => {
                          const isSelected = selectedDynamicQR?._id === qr._id;
                          return (
                            <div
                              key={qr._id}
                              onClick={() => handleSelectDynamicQR(qr)}
                              className={`group relative p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${isSelected
                                  ? "border-indigo-400 bg-indigo-900/60 ring-2 ring-indigo-400/40"
                                  : "border-indigo-800/60 bg-slate-950/60 hover:border-indigo-600 hover:bg-indigo-950/80"
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="p-1 rounded-lg bg-white shrink-0 shadow-xs">
                                  <StyledQRCode
                                    value={getSavedQrUrl(qr)}
                                    size={180}
                                    fgColor={qr.fgColor}
                                    bgColor={qr.bgColor}
                                    logo={qr.logo}
                                    logoSize={qr.logoSize}
                                    logoOpacity={qr.logoOpacity}
                                    logoPlacement={qr.logoPlacement}
                                    qrStyle={normalizeQrStyle(qr.qrStyle)}
                                    eyeFrame={normalizeQrStyle(qr.qrStyle).eyeFrame}
                                    eyeBall={normalizeQrStyle(qr.qrStyle).eyeBall}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className={`font-bold text-xs truncate ${isSelected ? "text-white" : "text-indigo-100 group-hover:text-white"
                                      }`}
                                  >
                                    {qr.name}
                                  </h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    <span
                                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${qr.type === "registration"
                                          ? "bg-blue-900/80 text-blue-200 border border-blue-700/50"
                                          : "bg-rose-900/80 text-rose-200 border border-rose-700/50"
                                        }`}
                                    >
                                      {qr.type}
                                    </span>
                                    {qr.activityType && qr.activityType !== "none" && (
                                      <span className="text-[9px] font-medium px-1.5 py-0.5 bg-indigo-900/80 text-indigo-300 rounded border border-indigo-800/40 capitalize">
                                        {qr.activityType}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] font-mono text-indigo-300/60 truncate mt-1">
                                    ID: {qr.qrId}
                                  </p>
                                </div>
                                {isSelected && (
                                  <div className="absolute top-2 right-2">
                                    <div className="bg-indigo-500 text-white p-0.5 rounded-full shadow-xs">
                                      <Check className="w-3 h-3" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview Panel */}
          <div className="lg:col-span-1 h-full">
            <div className="lg:sticky lg:top-8 bg-white rounded-[2rem] border border-gray-200 shadow-xl p-6 md:p-8 flex flex-col items-center transition-all hover:shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-bold text-gray-800 mb-6 w-full text-center">
                QR Preview
              </h2>

              <div className="bg-gray-50/80 p-6 rounded-[2.5rem] mb-8 w-full flex flex-col items-center justify-center border border-gray-100 shadow-inner">
                {generatedUrl || qrType === "activity" ? (
                  <div
                    ref={previewRef}
                    className="w-full max-w-[280px] sm:max-w-[320px] border border-gray-100 rounded-[2rem] shadow-lg p-6 flex flex-col items-center"
                    style={{
                      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.1)",
                      backgroundColor: cardBgColor,
                    }}
                  >
                    {effectiveLogo && logoPlacement === "top" && (
                      <img
                        src={effectiveLogo}
                        alt="Brand Logo"
                        className="object-contain rounded-xl mb-4"
                        style={{
                          opacity: logoOpacity,
                          height: `${logoSize}px`,
                          width: `${logoSize}px`,
                        }}
                      />
                    )}

                    {(brandingName || qrSubtitle) && (
                      <div className="text-center mb-1 w-full px-2">
                        {brandingName && (
                          <p className="font-extrabold  text-md lg:text-[12px] xl:text-[16px] leading-tight break-words" style={{ color: tempTitleColor }}>
                            {brandingName}
                          </p>
                        )}
                        {qrSubtitle && (
                          <p className="mx-auto mt-1 max-w-[220px] text-[11px] font-medium uppercase tracking-wider  leading-snug break-words [overflow-wrap:anywhere]" style={{ color: tempSubtitleColor }}>
                            {qrSubtitle}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="my-6 p-4  rounded-2xl  shadow-md flex items-center justify-center min-w-[212px] min-h-[212px]"  style={{
    backgroundColor: bgColor,
  }}>
                      {generatedUrl ? (
                        <StyledQRCode
                          value={generatedUrl}
                          size={180}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          logo={effectiveLogo}
                          logoSize={logoSize}
                          logoOpacity={logoOpacity}
                          logoPlacement={logoPlacement}
                          qrStyle={selectedQrStyle}
                          eyeFrame={selectedQrStyle.eyeFrame}
                          eyeBall={selectedQrStyle.eyeBall}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 text-center p-4 gap-3">
                          <QrCode className="w-12 h-12 opacity-20" />
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              {qrType === "activity"
                                ? "Activity Selection Required"
                                : "Setup Incomplete"}
                            </p>
                            <p className="text-[9px] text-gray-400 font-medium whitespace-pre-line">
                              {qrType === "activity"
                                ? "Please select an activity to\nview the complete preview"
                                : "Complete all fields to\ngenerate your QR code"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {qrStatement && (
                      <p className="text-sm font-bold  text-center leading-relaxed max-w-[200px] break-words" style={{
                        color: statementColor,
                      }}>
                        {qrStatement}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="w-[180px] h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-center p-6 text-sm gap-3">
                    <QrCode className="w-8 h-8 opacity-20" />
                    Complete setup to see preview
                  </div>
                )}
              </div>

              <div className="w-full space-y-5">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Target URL
                    </p>
                    {hasSavedDynamicQR && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded font-bold uppercase">
                        Ready
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-500 break-all line-clamp-3 leading-relaxed">
                    {generatedUrl || "---"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={!hasSavedDynamicQR}
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all gap-1.5 disabled:opacity-50 group"
                  >
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-indigo-700">
                      Copy Link
                    </span>
                  </button>

                  <a
                    href={hasSavedDynamicQR ? generatedUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all gap-1.5 ${!hasSavedDynamicQR ? "pointer-events-none opacity-50" : "group"}`}
                  >
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-indigo-700">
                      Test Link
                    </span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    disabled={!hasSavedDynamicQR}
                    onClick={downloadQR}
                    className="w-full py-4 rounded-2xl text-sm lg:text-[8px] xl:text-[12px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG
                  </button>
                  <button
                    disabled={!hasSavedDynamicQR}
                    onClick={downloadPDF}
                    className="w-full py-4 rounded-2xl bg-white hover:bg-gray-50 text-indigo-600 font-bold flex items-center justify-center gap-2 transition-all border-2 border-indigo-50 hover:border-indigo-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-5 h-5" />
                    HQ PDF
                  </button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100/50 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-[11px] text-indigo-700/80 leading-relaxed font-medium">
                  Scan this QR to preview the customer flow. Registration and
                  activities will be{" "}
                  {qrType === "registration" ? "direct" : "activity-based"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;
