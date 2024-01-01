// Ant Design custom theme
// https://ant.design/docs/react/customize-theme
import { theme } from "antd";

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontSize: 16,
    fontFamily: "Source Code Pro, monospace",
    colorPrimary: "rgba(255, 180, 84, 1)",
    colorPrimaryActive: "#ffc600",
    colorPrimaryHover: "#ffc600",
    colorPrimaryBg: "#15232d",
    // colorBgContainer: "rgba(24, 53, 73, 0.5)",
    colorBgLayout: "#15232d",
    // colorBgElevated: "rgba(24, 53, 73, 1)",
    // colorText: "rgba(255, 255, 255, 0.90)",
    colorTextSecondary: "#9ef68d",
    colorTextTertiary: "#9dffff",
    colorTextQuaternary: "rgba(255, 180, 84, 0.4)",
    colorBorder: "rgba(255, 255, 255, 0.10)",
    colorBorderSecondary: "rgba(255, 180, 84, 0.4)",
    colorSuccess: "#36be19",
    colorWarning: "#ffc600",
    colorError: "#ff618c",
    colorInfo: "#0087ff",
    colorBgBase: "#15232d",
    wireframe: true,
  },
};

export default darkTheme;
