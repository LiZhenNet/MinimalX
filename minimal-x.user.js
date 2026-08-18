// ==UserScript==
// @name         Minimal X / Twitter
// @namespace    https://github.com/typefully/minimal-twitter
// @version      1.1.2
// @description  精简 X/Twitter 界面，并提供时间线、导航和界面自定义选项。
// @author       Minimal Twitter contributors; userscript adaptation
// @license      MIT
// @source       https://github.com/typefully/minimal-twitter
// @homepageURL  https://github.com/LiZhenNet/MinimalX
// @supportURL   https://github.com/LiZhenNet/MinimalX/issues
// @updateURL    https://raw.githubusercontent.com/LiZhenNet/MinimalX/main/minimal-x.user.js
// @downloadURL  https://raw.githubusercontent.com/LiZhenNet/MinimalX/main/minimal-x.user.js
// @match        https://x.com/*
// @match        https://twitter.com/*
// @match        https://mobile.twitter.com/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*
 * This userscript is based on Minimal Twitter:
 * https://github.com/typefully/minimal-twitter
 *
 * MIT License
 * Copyright (c) 2022 Mailbrew Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(() => {
  "use strict";

  const STORAGE_KEY = "minimal-x-settings-v1";
  const STYLE_ID = "minimal-x-userscript-style";
  const PANEL_HOST_ID = "minimal-x-settings-host";
  const ADDED_NAV_ATTRIBUTE = "data-minimal-x-added";

  const selectors = {
    main: 'main[role="main"]',
    primaryColumn: '[data-testid="primaryColumn"]',
    leftSidebar: 'header[role="banner"]',
    leftNavigation: 'header[role="banner"] nav[role="navigation"]',
    rightSidebar: '[data-testid="sidebarColumn"]',
    profileLink: 'header[role="banner"] [data-testid="AppTabBar_Profile_Link"]',
    accountSwitcher: '[data-testid="SideNav_AccountSwitcher_Button"]',
    tweetButton: '[data-testid="SideNav_NewTweet_Button"]',
    searchForm: '[data-testid="sidebarColumn"] form[role="search"]',
    searchInput: '[data-testid="sidebarColumn"] form[role="search"] input',
    grokDrawer: '[data-testid="GrokDrawer"]',
    timelineTabs:
      '[data-testid="primaryColumn"] > div:first-child > div:first-child > div:first-child > div:only-child > nav:only-child',
  };

  const defaultSettings = {
    enabled: true,
    autoTimelineWidth: true,
    timelineWidth: 760,
    removeTimelineBorders: false,
    removeTweetBorders: false,
    stickyHeader: true,
    writerMode: false,
    showTrendsOnHome: false,
    removePromotedPosts: true,
    removeTopicsToFollow: true,
    removeTimelineTabs: false,
    hideViewCount: false,
    hideReplyCount: false,
    hideRetweetCount: false,
    hideLikeCount: false,
    hideFollowCount: false,
    hideRightSidebar: true,
    hideMessageDrawer: true,
    sidebarLogo: false,
    navigationLabels: "never",
    navigationCenter: false,
    showUnreadBadge: false,
    hideGrokDrawer: true,
    interFont: false,
    showSearchBar: true,
    transparentSearch: false,
    showTweetButton: true,
    titleNotifications: true,
    customCss: "",
    navigation: {
      home: true,
      explore: true,
      notifications: true,
      messages: true,
      grok: true,
      premium: false,
      lists: true,
      bookmarks: true,
      jobs: false,
      communities: true,
      articles: false,
      topics: false,
      verifiedOrgs: false,
      profile: true,
    },
  };

  const navigationItems = [
    {
      key: "home",
      label: "首页",
      selector: '[data-testid="AppTabBar_Home_Link"]',
    },
    {
      key: "explore",
      label: "探索",
      selector: '[data-testid="AppTabBar_Explore_Link"]',
    },
    {
      key: "notifications",
      label: "通知",
      selector: '[data-testid="AppTabBar_Notifications_Link"]',
    },
    {
      key: "messages",
      label: "私信",
      selector: '[data-testid="AppTabBar_DirectMessage_Link"]',
    },
    {
      key: "grok",
      label: "Grok",
      selector: 'a[href*="/grok"][role="link"]',
    },
    {
      key: "premium",
      label: "Premium",
      selector: 'a[href*="premium"][role="link"]',
      href: "/settings/premium",
      name: "Premium",
      iconPath:
        "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    },
    {
      key: "lists",
      label: "列表",
      selector: 'a[href*="/lists"][role="link"]',
      profileSuffix: "/lists",
      name: "Lists",
      iconPath:
        "M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z",
    },
    {
      key: "bookmarks",
      label: "书签",
      selector: 'a[href*="/bookmarks"][role="link"]',
    },
    {
      key: "jobs",
      label: "招聘",
      selector: 'a[href*="/jobs"][role="link"]',
      href: "/jobs",
      name: "Jobs",
      iconPath:
        "M19.5 6H17V4.5C17 3.12 15.88 2 14.5 2h-5C8.12 2 7 3.12 7 4.5V6H4.5C3.12 6 2 7.12 2 8.5v10C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-10C22 7.12 20.88 6 19.5 6zM9 4.5c0-.28.23-.5.5-.5h5c.28 0 .5.22.5.5V6H9V4.5zm11 14c0 .28-.22.5-.5.5h-15c-.27 0-.5-.22-.5-.5v-3.04c.59.35 1.27.54 2 .54h5v1h2v-1h5c.73 0 1.41-.19 2-.54v3.04zm0-6.49c0 1.1-.9 1.99-2 1.99h-5v-1h-2v1H6c-1.1 0-2-.9-2-2V8.5c0-.28.23-.5.5-.5h15c.28 0 .5.22.5.5v3.51z",
    },
    {
      key: "communities",
      label: "社群",
      selector: 'a[href*="/communities"][role="link"]',
      profileSuffix: "/communities",
      name: "Communities",
      iconPath:
        "M7.501 19.917 7.471 21H.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977.963 0 1.95.212 2.87.672a9.115 9.115 0 0 0-1.212 1.656 4.388 4.388 0 0 0-1.658-.329c-2.767 0-4.57 2.223-4.938 6.004H7.56c-.023.302-.05.599-.059.917zm15.998.056L23.528 21H9.472l.029-1.027c.184-6.618 3.736-8.977 7-8.977s6.816 2.358 7 8.977zM21.437 19c-.367-3.781-2.17-6.004-4.938-6.004S11.929 15.219 11.562 19h9.875zM16.499 10a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm-9 0a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z",
    },
    {
      key: "articles",
      label: "文章",
      selector: 'a[href="/compose/articles"]',
      href: "/compose/articles",
      name: "Articles",
      iconPath:
        "M7.164 2c-.53 0-1.039.21-1.414.586L2.586 5.75C2.21 6.125 2 6.634 2 7.164V21c0 .552.448 1 1 1h5.25a1 1 0 1 0 0-2H4V7.164L7.164 4h9.586v3.25a1 1 0 1 0 2 0V3a1 1 0 0 0-1-1H7.164zM7.75 6.25a1 1 0 1 0 0 2h6.5a1 1 0 1 0 0-2h-6.5zm-1.5 3.5a1 1 0 1 0 0 2h6.5a1 1 0 1 0 0-2h-6.5zm12.5-.664 4.414 4.414-8.5 8.5H10.25v-4.414l8.5-8.5z",
    },
    {
      key: "topics",
      label: "话题",
      selector: 'a[href*="/topics"][role="link"]',
      profileSuffix: "/topics",
      name: "Topics",
      iconPath:
        "M12 3.75C7.99 3.75 4.75 7 4.75 11s3.24 7.25 7.25 7.25h1v2.44c1.13-.45 2.42-1.3 3.54-2.54 1.52-1.67 2.66-3.95 2.71-6.67.07-4.46-3.28-7.73-7.25-7.73zM2.75 11c0-5.11 4.14-9.25 9.25-9.25s9.34 4.23 9.25 9.77c-.06 3.28-1.44 6.01-3.23 7.97-1.76 1.94-3.99 3.21-5.87 3.5L11 23.16V20.2c-4.64-.5-8.25-4.43-8.25-9.2zM15 10H9V8h6v2zm-2 4H9v-2h4v2z",
    },
    {
      key: "verifiedOrgs",
      label: "认证组织",
      selector: 'a[href*="verified-orgs"][role="link"]',
      href: "/i/verified-orgs-signup",
      name: "Verified Orgs",
      iconPath:
        "M7.323 2h11.443l-3 5h6.648L6.586 22.83 7.847 14H2.523l4.8-12zm1.354 2-3.2 8h4.676l-.739 5.17L17.586 9h-5.352l3-5H8.677z",
    },
    {
      key: "profile",
      label: "个人资料",
      selector: '[data-testid="AppTabBar_Profile_Link"]',
    },
  ];

  let settings = loadSettings();
  let currentUrl = location.href;
  let updateTimer = null;
  let customCssTimer = null;
  let allowGrokDrawer = false;
  let observer = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeSettings(saved) {
    const merged = {
      ...clone(defaultSettings),
      ...(saved && typeof saved === "object" ? saved : {}),
    };
    merged.navigation = {
      ...defaultSettings.navigation,
      ...(saved?.navigation && typeof saved.navigation === "object"
        ? saved.navigation
        : {}),
    };
    const timelineWidth = Number(merged.timelineWidth);
    merged.timelineWidth =
      Number.isFinite(timelineWidth) &&
      timelineWidth >= 600 &&
      timelineWidth <= 1000
        ? Math.round(timelineWidth / 20) * 20
        : defaultSettings.timelineWidth;
    merged.navigationLabels = ["never", "hover", "always"].includes(
      merged.navigationLabels,
    )
      ? merged.navigationLabels
      : defaultSettings.navigationLabels;
    return merged;
  }

  function loadSettings() {
    try {
      return mergeSettings(GM_getValue(STORAGE_KEY, {}));
    } catch (error) {
      console.warn("[Minimal X] 读取设置失败，已使用默认值。", error);
      return clone(defaultSettings);
    }
  }

  function persistSettings() {
    try {
      GM_setValue(STORAGE_KEY, settings);
    } catch (error) {
      console.warn("[Minimal X] 保存设置失败。", error);
    }
  }

  function isHomeRoute() {
    return location.pathname === "/" || location.pathname.startsWith("/home");
  }

  function isSearchRoute() {
    return location.pathname === "/search";
  }

  function isWriterRoute() {
    return (
      isHomeRoute() ||
      location.pathname.startsWith("/compose/post") ||
      location.pathname.startsWith("/compose/tweet")
    );
  }

  function getPageTheme() {
    const declaredTheme = document.documentElement.dataset.theme;
    if (["light", "dim", "dark"].includes(declaredTheme)) {
      return declaredTheme;
    }

    const background = getComputedStyle(document.body || document.documentElement)
      .backgroundColor;
    const channels = background.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number);
    if (!channels || channels.length < 3) return "light";

    const luminance =
      channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    return luminance < 96 ? "dark" : "light";
  }

  function syncPanelTheme() {
    const host = document.getElementById(PANEL_HOST_ID);
    if (host) host.dataset.theme = getPageTheme();
  }

  function ensureStyleElement() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    return style;
  }

  function cssForNavigationVisibility() {
    return navigationItems
      .filter((item) => !settings.navigation[item.key])
      .map(
        (item) =>
          `${selectors.leftNavigation} ${item.selector} { display: none !important; }`,
      )
      .join("\n");
  }

  function cssForNavigationLabels() {
    const labels = `${selectors.leftNavigation} > * > div > div + div:last-child`;
    const accountLabel = `${selectors.accountSwitcher} > div:not(:first-child)`;

    if (settings.navigationLabels === "never") {
      return `
        ${labels},
        ${accountLabel} {
          display: none !important;
        }
      `;
    }

    if (settings.navigationLabels === "hover") {
      return `
        ${labels},
        ${accountLabel} {
          display: inline-flex !important;
          opacity: 0;
          transition: opacity 160ms ease;
        }
        ${selectors.leftNavigation}:hover > * > div > div + div:last-child,
        ${selectors.accountSwitcher}:hover > div:not(:first-child) {
          opacity: 1;
        }
      `;
    }

    return "";
  }

  function cssForCounts() {
    const rules = [];
    if (settings.hideViewCount) {
      rules.push(`
        [role="group"] a[href*="/analytics"],
        [data-testid="tweet"] a[href*="/analytics"] {
          display: none !important;
        }
      `);
    }
    if (settings.hideReplyCount) {
      rules.push(`
        [data-testid="reply"] span,
        [data-testid="reply"] [data-testid="app-text-transition-container"] {
          visibility: hidden !important;
        }
      `);
    }
    if (settings.hideRetweetCount) {
      rules.push(`
        a[href$="/retweets"],
        a[href$="/retweets/with_comments"],
        [data-testid="retweet"] span,
        [data-testid="unretweet"] span {
          visibility: hidden !important;
        }
      `);
    }
    if (settings.hideLikeCount) {
      rules.push(`
        a[href$="/likes"][href*="/status/"],
        [data-testid="like"] span,
        [data-testid="unlike"] span {
          visibility: hidden !important;
        }
      `);
    }
    if (settings.hideFollowCount) {
      rules.push(`
        a[href$="/following"][dir][role="link"],
        a[href$="/followers"][dir][role="link"] {
          display: none !important;
        }
      `);
    }
    return rules.join("\n");
  }

  function buildStyles() {
    if (!settings.enabled) return "";

    const routeIsHome = isHomeRoute();
    const hideRightSidebar =
      settings.hideRightSidebar &&
      !isSearchRoute() &&
      !(routeIsHome && settings.showTrendsOnHome);
    const preferredTimelineWidth = settings.autoTimelineWidth
      ? "clamp(600px, 44vw, 800px)"
      : `${settings.timelineWidth}px`;
    const constrainedTimelineWidth = `min(${preferredTimelineWidth}, calc(100vw - 48px))`;

    return `
      /* Base layout adapted from Minimal Twitter 6.4.1. */
      @media only screen and (min-width: 1000px) {
        ${selectors.main} {
          align-items: center;
          justify-content: center;
          overflow-x: clip;
          box-sizing: border-box;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        ${selectors.primaryColumn} {
          margin: 0 auto;
          width: ${constrainedTimelineWidth};
          max-width: ${constrainedTimelineWidth};
        }
        ${selectors.primaryColumn} > div > div:last-child,
        ${selectors.primaryColumn} > div > div:last-child
          div:not([data-testid="dm-message-list-container"] *) {
          max-width: unset;
        }
        ${selectors.leftSidebar} {
          position: fixed;
          left: 0;
          align-items: flex-start;
        }
        ${selectors.leftSidebar} h1[role="heading"] {
          padding-top: 4px;
        }
        ${selectors.leftSidebar} > div > div > div > div:first-child {
          flex-shrink: 1;
          overflow-y: auto;
        }
        ${selectors.tweetButton} {
          position: fixed;
          right: 16px;
          bottom: 24px;
        }
      }
      ${
        settings.removeTimelineBorders
          ? `
            @media only screen and (min-width: 988px) {
              ${selectors.primaryColumn} {
                border-style: hidden !important;
              }
            }
          `
          : ""
      }
      ${selectors.accountSwitcher} {
        bottom: 12px;
      }
      ${selectors.rightSidebar} {
        margin-left: 12px;
        ${
          hideRightSidebar
            ? "visibility: hidden !important; width: 0 !important; margin: 0 !important; padding: 0 !important; z-index: 1;"
            : ""
        }
      }
      ${
        settings.showSearchBar
          ? `
            @media only screen and (min-width: 1100px) {
              ${selectors.searchForm} {
                visibility: visible !important;
                position: fixed;
                top: 12px;
                right: 16px;
                width: auto;
                z-index: 3;
              }
              ${selectors.searchInput} {
                width: 154px;
              }
              ${selectors.searchForm}:focus-within {
                width: 374px;
                backdrop-filter: blur(12px);
              }
              ${selectors.searchForm}:focus-within ${selectors.searchInput} {
                width: 100% !important;
              }
            }
          `
          : `
            ${selectors.searchForm} {
              display: none !important;
              visibility: hidden !important;
            }
          `
      }
      ${
        settings.transparentSearch
          ? `
            ${selectors.searchForm} > div:first-child > div {
              background-color: transparent !important;
            }
          `
          : ""
      }
      ${
        settings.hideMessageDrawer
          ? `
            [data-testid="DMDrawer"],
            [data-testid="chat-drawer-root"] {
              display: none !important;
            }
          `
          : ""
      }
      ${
        settings.removePromotedPosts
          ? `
            [data-testid="placementTracking"] article,
            article:has(a[href*="quick_promote_web"]),
            a[href*="quick_promote_web"] {
              display: none !important;
            }
          `
          : ""
      }
      ${
        settings.removeTopicsToFollow
          ? `
            ${selectors.primaryColumn} section[aria-labelledby^="accessible-list-"] > div[aria-label$="Carousel"],
            ${selectors.primaryColumn} a[href*="/i/flow/topics_selector"],
            ${selectors.primaryColumn} a[href*="/i/topics/picker/home"],
            ${selectors.primaryColumn} [data-testid="cellInnerDiv"]:has(a[href*="/i/flow/topics_selector"]),
            ${selectors.primaryColumn} [data-testid="cellInnerDiv"]:has(a[href*="/i/topics/picker/home"]) {
              display: none !important;
            }
            [aria-label="Lists timeline"] section[aria-labelledby^="accessible-list-"] > div[aria-label$="Carousel"] {
              display: flex !important;
            }
          `
          : ""
      }
      ${
        settings.removeTweetBorders
          ? `
            ${selectors.main} section > div > div > div > div[role="separator"] {
              display: none !important;
            }
            ${selectors.primaryColumn} > div > div:empty {
              background: transparent !important;
            }
          `
          : ""
      }
      ${
        !settings.stickyHeader
          ? `
            ${selectors.primaryColumn} > div > div {
              position: static !important;
            }
          `
          : ""
      }
      ${
        routeIsHome && settings.removeTimelineTabs && !settings.writerMode
          ? `
            ${selectors.timelineTabs} {
              display: none !important;
            }
          `
          : ""
      }
      ${
        routeIsHome && settings.showTrendsOnHome && !settings.writerMode
          ? `
            @media only screen and (min-width: 1265px) {
              ${selectors.rightSidebar} {
                visibility: visible !important;
                width: 350px !important;
              }
              ${selectors.rightSidebar} section[aria-labelledby^="accessible-list-"] {
                visibility: visible;
                position: fixed;
                right: 16px;
                top: 66px;
                max-height: 78vh;
                overflow: auto;
                width: 300px;
                border: 1px solid rgba(127, 127, 127, 0.25);
                border-radius: 8px;
                background: rgb(255 255 255 / 0.92);
                backdrop-filter: blur(12px);
              }
              html[data-theme="dim"] ${selectors.rightSidebar} section[aria-labelledby^="accessible-list-"] {
                background: rgb(21 32 43 / 0.92);
              }
              html[data-theme="dark"] ${selectors.rightSidebar} section[aria-labelledby^="accessible-list-"] {
                background: rgb(0 0 0 / 0.92);
              }
            }
          `
          : ""
      }
      ${
        !settings.sidebarLogo
          ? `
            ${selectors.leftSidebar} h1[role="heading"] {
              display: none !important;
            }
          `
          : ""
      }
      ${cssForNavigationVisibility()}
      ${cssForNavigationLabels()}
      ${
        settings.navigationCenter
          ? `
            ${selectors.leftSidebar} > div > div > div {
              justify-content: center;
              padding-top: 0;
            }
          `
          : ""
      }
      ${
        !settings.showUnreadBadge
          ? `
            ${selectors.leftNavigation} a svg + div[aria-label]:only-of-type,
            ${selectors.accountSwitcher} > div > svg + div[aria-label] {
              display: none !important;
            }
          `
          : ""
      }
      ${
        settings.hideGrokDrawer
          ? `
            ${selectors.grokDrawer}:not([data-minimal-x-allowed="true"]) {
              display: none !important;
            }
          `
          : ""
      }
      ${
        !settings.showTweetButton
          ? `
            ${selectors.tweetButton} {
              visibility: hidden !important;
            }
          `
          : ""
      }
      ${
        settings.interFont
          ? `
            @font-face {
              font-family: "MinimalXInter";
              src: url("https://raw.githubusercontent.com/typefully/minimal-twitter/main/fonts/inter-subset.woff2") format("woff2");
              font-display: swap;
            }
            div, span, input, textarea, button {
              font-family: MinimalXInter, Inter, TwitterChirp, -apple-system,
                BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
                sans-serif !important;
            }
          `
          : ""
      }
      ${cssForCounts()}
      ${
        settings.writerMode && isWriterRoute()
          ? `
            body {
              padding-left: 0 !important;
              overflow: hidden !important;
            }
            ${selectors.primaryColumn} {
              border-style: hidden !important;
              padding-top: 3vh;
              margin: 0 auto !important;
            }
            ${selectors.main} {
              flex-basis: 100%;
            }
            ${selectors.main} > div {
              width: 100%;
              max-width: 100%;
            }
            ${selectors.leftSidebar},
            ${selectors.rightSidebar},
            ${selectors.primaryColumn} > div > div:not(:nth-of-type(1)):not(:nth-of-type(2)):not(:nth-of-type(3)) {
              visibility: hidden !important;
              opacity: 0 !important;
              width: 0 !important;
              height: 0 !important;
              overflow: hidden !important;
            }
            ${selectors.primaryColumn} > div > div:first-child {
              visibility: hidden !important;
            }
            div[aria-labelledby="modal-header"][role="dialog"] {
              width: 100vw;
              max-width: 100vw;
              top: 0;
              border-radius: 0;
            }
          `
          : ""
      }
      ${settings.customCss || ""}
    `;
  }

  function applyStyles() {
    ensureStyleElement().textContent = buildStyles();
  }

  function getNavigationHref(item, profileLink) {
    if (item.href) return item.href;
    if (!item.profileSuffix) return "";

    try {
      const profileUrl = new URL(profileLink.href, location.origin);
      return `${profileUrl.pathname.replace(/\/$/, "")}${item.profileSuffix}`;
    } catch {
      return "";
    }
  }

  function updateClonedNavigationLabel(node, label) {
    const textNodes = Array.from(node.querySelectorAll("span")).filter(
      (span) => span.children.length === 0 && span.textContent.trim(),
    );
    const target = textNodes.at(-1);
    if (target) target.textContent = label;
  }

  function createNavigationItem(item, profileLink) {
    const href = getNavigationHref(item, profileLink);
    if (!href || !item.iconPath || !item.name) return null;

    const node = profileLink.cloneNode(true);
    node.href = href;
    node.setAttribute(ADDED_NAV_ATTRIBUTE, item.key);
    node.setAttribute("aria-label", item.name);
    node.removeAttribute("data-testid");
    node.removeAttribute("aria-current");
    node.querySelectorAll("[aria-current]").forEach((element) => {
      element.removeAttribute("aria-current");
    });

    const svg = node.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.innerHTML = `<path d="${item.iconPath}"></path>`;
    }
    updateClonedNavigationLabel(node, item.name);
    return node;
  }

  function syncNavigationItems() {
    const navigation = document.querySelector(selectors.leftNavigation);
    const profileLink = document.querySelector(selectors.profileLink);
    if (!navigation || !profileLink) return;

    navigationItems.forEach((item) => {
      if (!item.iconPath) return;

      const addedSelector = `[${ADDED_NAV_ATTRIBUTE}="${item.key}"]`;
      const addedItems = Array.from(navigation.querySelectorAll(addedSelector));
      const nativeItem = Array.from(
        navigation.querySelectorAll(item.selector),
      ).find((element) => !element.hasAttribute(ADDED_NAV_ATTRIBUTE));

      if (!settings.enabled || !settings.navigation[item.key] || nativeItem) {
        addedItems.forEach((element) => element.remove());
        return;
      }

      if (addedItems.length > 1) {
        addedItems.slice(1).forEach((element) => element.remove());
      }
      if (addedItems.length === 0) {
        const newItem = createNavigationItem(item, profileLink);
        if (newItem) profileLink.insertAdjacentElement("beforebegin", newItem);
      }
    });
  }

  function syncTitle() {
    if (!settings.enabled) return;

    if (settings.writerMode && isWriterRoute()) {
      if (document.title !== "Writer Mode") document.title = "Writer Mode";
      return;
    }

    if (!settings.titleNotifications) {
      const cleanTitle = document.title.replace(/^\(\d+\+?\)\s*/, "");
      if (cleanTitle !== document.title) document.title = cleanTitle;
    }
  }

  function syncGrokDrawer() {
    if (!settings.enabled || !settings.hideGrokDrawer) return;
    document.querySelectorAll(selectors.grokDrawer).forEach((drawer) => {
      if (allowGrokDrawer) {
        drawer.setAttribute("data-minimal-x-allowed", "true");
      } else {
        drawer.removeAttribute("data-minimal-x-allowed");
      }
    });
  }

  function runDynamicUpdates() {
    updateTimer = null;

    if (currentUrl !== location.href) {
      currentUrl = location.href;
      allowGrokDrawer = false;
      applyStyles();
    }

    if (!settings.enabled) {
      document
        .querySelectorAll(`[${ADDED_NAV_ATTRIBUTE}]`)
        .forEach((element) => element.remove());
      return;
    }

    syncNavigationItems();
    syncGrokDrawer();
    syncTitle();
    syncPanelTheme();
  }

  function scheduleDynamicUpdates() {
    if (updateTimer !== null) return;
    updateTimer = window.setTimeout(runDynamicUpdates, 80);
  }

  function applyAll() {
    applyStyles();
    runDynamicUpdates();
  }

  function saveAndApply() {
    persistSettings();
    applyAll();
  }

  function setSetting(path, value) {
    const parts = path.split(".");
    if (parts.length === 2) {
      settings[parts[0]][parts[1]] = value;
    } else {
      settings[path] = value;
    }
    saveAndApply();
  }

  function switchMarkup(key, label, checked = settings[key]) {
    return `
      <label class="setting-row">
        <span>${label}</span>
        <span class="switch">
          <input type="checkbox" data-setting="${key}" ${checked ? "checked" : ""}>
          <span class="switch-track" aria-hidden="true"></span>
        </span>
      </label>
    `;
  }

  function navigationMarkup() {
    return navigationItems
      .map(
        (item) => `
          <label class="nav-option">
            <input
              type="checkbox"
              data-setting="navigation.${item.key}"
              ${settings.navigation[item.key] ? "checked" : ""}
            >
            <span>${item.label}</span>
          </label>
        `,
      )
      .join("");
  }

  function panelStyles() {
    return `
      :host {
        all: initial;
        color-scheme: light;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        letter-spacing: 0;
      }
      :host([data-theme="dim"]),
      :host([data-theme="dark"]) {
        color-scheme: dark;
      }
      * {
        box-sizing: border-box;
        letter-spacing: 0;
      }
      button, input, select, textarea {
        font: inherit;
      }
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgb(0 0 0 / 0.5);
      }
      .dialog {
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr) auto;
        width: min(760px, 100%);
        max-height: min(760px, calc(100vh - 40px));
        overflow: hidden;
        color: #0f1419;
        background: #fff;
        border: 1px solid #d8e0e5;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgb(0 0 0 / 0.28);
      }
      .header {
        display: flex;
        align-items: center;
        min-height: 56px;
        padding: 0 16px;
        border-bottom: 1px solid #eff3f4;
      }
      h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 750;
      }
      .enabled {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        font-size: 13px;
        font-weight: 650;
      }
      .icon-button {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        margin-left: 8px;
        padding: 0;
        color: inherit;
        background: transparent;
        border: 0;
        border-radius: 50%;
        cursor: pointer;
      }
      .icon-button:hover {
        background: #eff3f4;
      }
      .icon-button span {
        font-size: 24px;
        line-height: 1;
      }
      .tabs {
        display: flex;
        gap: 2px;
        padding: 6px 12px 0;
        border-bottom: 1px solid #eff3f4;
      }
      .tab {
        position: relative;
        min-width: 72px;
        padding: 10px 12px 11px;
        color: #536471;
        background: transparent;
        border: 0;
        cursor: pointer;
        font-size: 14px;
        font-weight: 650;
      }
      .tab[aria-selected="true"] {
        color: #0f1419;
      }
      .tab[aria-selected="true"]::after {
        position: absolute;
        right: 12px;
        bottom: 0;
        left: 12px;
        height: 3px;
        background: #1d9bf0;
        border-radius: 2px 2px 0 0;
        content: "";
      }
      .content {
        overflow: auto;
        padding: 6px 18px 18px;
      }
      .panel[hidden] {
        display: none;
      }
      .group {
        padding: 14px 0 8px;
        border-bottom: 1px solid #eff3f4;
      }
      .group:last-child {
        border-bottom: 0;
      }
      h2 {
        margin: 0 0 8px;
        color: #536471;
        font-size: 12px;
        font-weight: 750;
        text-transform: uppercase;
      }
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 38px;
        gap: 16px;
        font-size: 14px;
        cursor: pointer;
      }
      .switch {
        position: relative;
        display: inline-flex;
        flex: 0 0 auto;
      }
      .switch input {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
      }
      .switch-track {
        position: relative;
        width: 34px;
        height: 20px;
        background: #8b98a5;
        border-radius: 10px;
        transition: background 120ms ease;
      }
      .switch-track::after {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 14px;
        height: 14px;
        background: #fff;
        border-radius: 50%;
        transition: transform 120ms ease;
        content: "";
      }
      .switch input:checked + .switch-track {
        background: #1d9bf0;
      }
      .switch input:checked + .switch-track::after {
        transform: translateX(14px);
      }
      .switch input:focus-visible + .switch-track {
        outline: 2px solid #1d9bf0;
        outline-offset: 2px;
      }
      .range-row {
        display: grid;
        grid-template-columns: 1fr 58px;
        align-items: center;
        min-height: 42px;
        gap: 14px;
        font-size: 14px;
      }
      .range-control {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      input[type="range"] {
        width: 100%;
        accent-color: #1d9bf0;
      }
      output {
        color: #536471;
        font-variant-numeric: tabular-nums;
        text-align: right;
      }
      .segmented {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        width: min(330px, 58%);
        overflow: hidden;
        border: 1px solid #cfd9de;
        border-radius: 6px;
      }
      .segment {
        padding: 6px 8px;
        color: #536471;
        background: transparent;
        border: 0;
        border-right: 1px solid #cfd9de;
        cursor: pointer;
        font-size: 12px;
      }
      .segment:last-child {
        border-right: 0;
      }
      .segment[aria-pressed="true"] {
        color: #fff;
        background: #1d9bf0;
      }
      .nav-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      .nav-option {
        display: flex;
        align-items: center;
        min-width: 0;
        min-height: 34px;
        gap: 8px;
        padding: 0 8px;
        border: 1px solid #cfd9de;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
      }
      .nav-option input {
        width: 15px;
        height: 15px;
        margin: 0;
        accent-color: #1d9bf0;
      }
      .nav-option span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      textarea {
        width: 100%;
        min-height: 240px;
        resize: vertical;
        padding: 10px 12px;
        color: #0f1419;
        background: #f7f9f9;
        border: 1px solid #cfd9de;
        border-radius: 6px;
        outline: 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 12px;
        line-height: 1.55;
        tab-size: 2;
      }
      textarea:focus {
        border-color: #1d9bf0;
        box-shadow: 0 0 0 1px #1d9bf0;
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        min-height: 54px;
        padding: 9px 16px;
        border-top: 1px solid #eff3f4;
      }
      .button {
        min-height: 34px;
        padding: 0 14px;
        color: #0f1419;
        background: #fff;
        border: 1px solid #cfd9de;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 650;
      }
      .button:hover {
        background: #f7f9f9;
      }
      .button.primary {
        color: #fff;
        background: #0f1419;
        border-color: #0f1419;
      }
      .button.primary:hover {
        background: #272c30;
      }
      :host([data-theme="dim"]) .dialog,
      :host([data-theme="dark"]) .dialog {
        color: #e7e9ea;
        background: #000;
        border-color: #2f3336;
      }
      :host([data-theme="dim"]) .dialog {
        background: #15202b;
      }
      :host([data-theme="dim"]) .header,
      :host([data-theme="dim"]) .tabs,
      :host([data-theme="dim"]) .group,
      :host([data-theme="dim"]) .footer,
      :host([data-theme="dark"]) .header,
      :host([data-theme="dark"]) .tabs,
      :host([data-theme="dark"]) .group,
      :host([data-theme="dark"]) .footer {
        border-color: #2f3336;
      }
      :host([data-theme="dim"]) .icon-button:hover,
      :host([data-theme="dark"]) .icon-button:hover {
        background: #273340;
      }
      :host([data-theme="dark"]) .icon-button:hover {
        background: #16181c;
      }
      :host([data-theme="dim"]) .tab,
      :host([data-theme="dim"]) h2,
      :host([data-theme="dim"]) output,
      :host([data-theme="dark"]) .tab,
      :host([data-theme="dark"]) h2,
      :host([data-theme="dark"]) output {
        color: #8b98a5;
      }
      :host([data-theme="dim"]) .tab[aria-selected="true"],
      :host([data-theme="dark"]) .tab[aria-selected="true"] {
        color: #e7e9ea;
      }
      :host([data-theme="dim"]) .segmented,
      :host([data-theme="dim"]) .segment,
      :host([data-theme="dim"]) .nav-option,
      :host([data-theme="dark"]) .segmented,
      :host([data-theme="dark"]) .segment,
      :host([data-theme="dark"]) .nav-option {
        border-color: #536471;
      }
      :host([data-theme="dim"]) textarea,
      :host([data-theme="dark"]) textarea {
        color: #e7e9ea;
        background: #16181c;
        border-color: #536471;
      }
      :host([data-theme="dim"]) textarea {
        background: #1e2732;
      }
      :host([data-theme="dim"]) .button,
      :host([data-theme="dark"]) .button {
        color: #e7e9ea;
        background: transparent;
        border-color: #536471;
      }
      :host([data-theme="dim"]) .button:hover {
        background: #273340;
      }
      :host([data-theme="dark"]) .button:hover {
        background: #16181c;
      }
      :host([data-theme="dim"]) .button.primary,
      :host([data-theme="dark"]) .button.primary {
        color: #0f1419;
        background: #eff3f4;
        border-color: #eff3f4;
      }
      :host([data-theme="dim"]) .button.primary:hover,
      :host([data-theme="dark"]) .button.primary:hover {
        background: #d7dbdc;
      }
      @media (max-width: 620px) {
        .overlay {
          padding: 0;
        }
        .dialog {
          width: 100%;
          height: 100%;
          max-height: none;
          border: 0;
          border-radius: 0;
        }
        .tabs {
          overflow-x: auto;
        }
        .tab {
          flex: 1;
          min-width: 68px;
        }
        .content {
          padding-right: 14px;
          padding-left: 14px;
        }
        .nav-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .segmented {
          width: 62%;
        }
      }
    `;
  }

  function panelMarkup() {
    return `
      <style>${panelStyles()}</style>
      <div class="overlay">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="minimal-x-panel-title"
        >
          <header class="header">
            <h1 id="minimal-x-panel-title">Minimal X 设置</h1>
            <label class="enabled">
              <span>启用</span>
              <span class="switch">
                <input type="checkbox" data-setting="enabled" ${settings.enabled ? "checked" : ""}>
                <span class="switch-track" aria-hidden="true"></span>
              </span>
            </label>
            <button class="icon-button" data-action="close" aria-label="关闭" title="关闭">
              <span aria-hidden="true">×</span>
            </button>
          </header>
          <nav class="tabs" aria-label="设置分类">
            <button class="tab" data-tab="timeline" aria-selected="true">时间线</button>
            <button class="tab" data-tab="navigation" aria-selected="false">导航</button>
            <button class="tab" data-tab="interface" aria-selected="false">界面</button>
            <button class="tab" data-tab="advanced" aria-selected="false">高级</button>
          </nav>
          <main class="content">
            <section class="panel" data-panel="timeline">
              <div class="group">
                <h2>布局</h2>
                ${switchMarkup("autoTimelineWidth", "自适应时间线宽度")}
                <label class="range-row">
                  <span class="range-control">
                    <span>固定宽度</span>
                    <input
                      type="range"
                      min="600"
                      max="1000"
                      step="20"
                      value="${settings.timelineWidth}"
                      data-setting="timelineWidth"
                      ${settings.autoTimelineWidth ? "disabled" : ""}
                    >
                  </span>
                  <output data-output="timelineWidth">${settings.autoTimelineWidth ? "自动" : `${settings.timelineWidth}px`}</output>
                </label>
                ${switchMarkup("stickyHeader", "吸顶标题栏")}
                ${switchMarkup("showTrendsOnHome", "首页显示趋势")}
                ${switchMarkup("removeTimelineTabs", "隐藏“为你推荐/正在关注”标签")}
                ${switchMarkup("removeTimelineBorders", "隐藏时间线边框")}
                ${switchMarkup("removeTweetBorders", "隐藏帖子分隔线")}
              </div>
              <div class="group">
                <h2>内容过滤</h2>
                ${switchMarkup("removePromotedPosts", "移除推广帖子")}
                ${switchMarkup("removeTopicsToFollow", "移除关注建议")}
                ${switchMarkup("hideViewCount", "隐藏浏览量")}
              </div>
              <div class="group">
                <h2>弱化数字</h2>
                ${switchMarkup("hideReplyCount", "隐藏回复数")}
                ${switchMarkup("hideRetweetCount", "隐藏转帖数")}
                ${switchMarkup("hideLikeCount", "隐藏点赞数")}
                ${switchMarkup("hideFollowCount", "隐藏关注/粉丝数")}
              </div>
              <div class="group">
                <h2>写作</h2>
                ${switchMarkup("writerMode", "Zen 写作模式")}
              </div>
            </section>
            <section class="panel" data-panel="navigation" hidden>
              <div class="group">
                <h2>导航项目</h2>
                <div class="nav-grid">${navigationMarkup()}</div>
              </div>
              <div class="group">
                <h2>导航样式</h2>
                ${switchMarkup("sidebarLogo", "显示 X 标志")}
                <div class="setting-row">
                  <span>文字标签</span>
                  <div class="segmented" role="group" aria-label="导航文字标签">
                    <button class="segment" data-label-mode="never" aria-pressed="${settings.navigationLabels === "never"}">不显示</button>
                    <button class="segment" data-label-mode="hover" aria-pressed="${settings.navigationLabels === "hover"}">悬停</button>
                    <button class="segment" data-label-mode="always" aria-pressed="${settings.navigationLabels === "always"}">始终</button>
                  </div>
                </div>
                ${switchMarkup("navigationCenter", "垂直居中")}
                ${switchMarkup("showUnreadBadge", "显示未读数量")}
                ${switchMarkup("hideGrokDrawer", "隐藏 Grok 抽屉")}
              </div>
            </section>
            <section class="panel" data-panel="interface" hidden>
              <div class="group">
                <h2>侧栏</h2>
                ${switchMarkup("hideRightSidebar", "隐藏右侧栏")}
                ${switchMarkup("hideMessageDrawer", "隐藏消息抽屉")}
                ${switchMarkup("showSearchBar", "显示搜索框")}
                ${switchMarkup("transparentSearch", "透明搜索框")}
              </div>
              <div class="group">
                <h2>全局</h2>
                ${switchMarkup("showTweetButton", "显示发帖按钮")}
                ${switchMarkup("interFont", "使用 Inter 字体")}
                ${switchMarkup("titleNotifications", "标题显示通知数量")}
              </div>
            </section>
            <section class="panel" data-panel="advanced" hidden>
              <div class="group">
                <h2>自定义 CSS</h2>
                <textarea
                  data-setting="customCss"
                  spellcheck="false"
                  aria-label="自定义 CSS"
                  placeholder="/* 在这里输入自定义 CSS */"
                ></textarea>
              </div>
            </section>
          </main>
          <footer class="footer">
            <button class="button" data-action="reset">恢复默认</button>
            <button class="button primary" data-action="close">完成</button>
          </footer>
        </div>
      </div>
    `;
  }

  function closeSettingsPanel() {
    document.getElementById(PANEL_HOST_ID)?.remove();
  }

  function selectPanelTab(shadowRoot, tabName) {
    shadowRoot.querySelectorAll("[data-tab]").forEach((button) => {
      button.setAttribute(
        "aria-selected",
        String(button.dataset.tab === tabName),
      );
    });
    shadowRoot.querySelectorAll("[data-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tabName;
    });
  }

  function bindPanelEvents(shadowRoot) {
    const customCss = shadowRoot.querySelector(
      'textarea[data-setting="customCss"]',
    );
    customCss.value = settings.customCss;

    shadowRoot.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton?.dataset.action === "close") {
        closeSettingsPanel();
        return;
      }
      if (actionButton?.dataset.action === "reset") {
        settings = clone(defaultSettings);
        saveAndApply();
        closeSettingsPanel();
        openSettingsPanel();
        return;
      }

      const tabButton = event.target.closest("[data-tab]");
      if (tabButton) {
        selectPanelTab(shadowRoot, tabButton.dataset.tab);
        return;
      }

      const segment = event.target.closest("[data-label-mode]");
      if (segment) {
        setSetting("navigationLabels", segment.dataset.labelMode);
        shadowRoot.querySelectorAll("[data-label-mode]").forEach((button) => {
          button.setAttribute(
            "aria-pressed",
            String(button === segment),
          );
        });
      }
    });

    shadowRoot.addEventListener("change", (event) => {
      const input = event.target.closest("[data-setting]");
      if (!input || input.dataset.setting === "customCss") return;

      const value =
        input.type === "checkbox"
          ? input.checked
          : input.type === "range"
            ? Number(input.value)
            : input.value;
      setSetting(input.dataset.setting, value);

      if (input.dataset.setting === "autoTimelineWidth") {
        const widthInput = shadowRoot.querySelector(
          'input[data-setting="timelineWidth"]',
        );
        const output = shadowRoot.querySelector(
          '[data-output="timelineWidth"]',
        );
        widthInput.disabled = input.checked;
        output.textContent = input.checked
          ? "自动"
          : `${widthInput.value}px`;
      }

      if (input.type === "range") {
        const output = shadowRoot.querySelector(
          `[data-output="${input.dataset.setting}"]`,
        );
        if (output) output.textContent = `${input.value}px`;
      }
    });

    customCss.addEventListener("input", () => {
      window.clearTimeout(customCssTimer);
      customCssTimer = window.setTimeout(() => {
        setSetting("customCss", customCss.value.trim());
      }, 350);
    });

    shadowRoot.querySelector(".overlay").addEventListener("click", (event) => {
      if (event.target.classList.contains("overlay")) closeSettingsPanel();
    });
  }

  function openSettingsPanel() {
    const existing = document.getElementById(PANEL_HOST_ID);
    if (existing) {
      existing.shadowRoot?.querySelector('[data-action="close"]')?.focus();
      return;
    }

    const host = document.createElement("div");
    host.id = PANEL_HOST_ID;
    host.dataset.theme = getPageTheme();
    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = panelMarkup();
    (document.body || document.documentElement).appendChild(host);
    bindPanelEvents(shadowRoot);
    shadowRoot.querySelector('[data-action="close"]')?.focus();
  }

  function handleKeydown(event) {
    if (event.key !== "Escape") return;

    if (document.getElementById(PANEL_HOST_ID)) {
      event.preventDefault();
      closeSettingsPanel();
      return;
    }

    if (settings.enabled && settings.writerMode) {
      event.preventDefault();
      setSetting("writerMode", false);
    }
  }

  function handleDocumentClick(event) {
    if (!settings.enabled || !settings.hideGrokDrawer) return;
    const button = event.target.closest("button");
    if (!button) return;

    const label = button.getAttribute("aria-label") || "";
    const containsGrokIcon = Boolean(
      button.querySelector(
        'svg path[d^="M12.745 20.54"], svg path[d*="10.97-8.19"]',
      ),
    );
    if (/grok/i.test(label) || containsGrokIcon) {
      allowGrokDrawer = true;
      scheduleDynamicUpdates();
    }
  }

  function initialize() {
    applyStyles();
    runDynamicUpdates();

    observer = new MutationObserver(scheduleDynamicUpdates);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
      childList: true,
      subtree: true,
    });

    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("resize", scheduleDynamicUpdates, {
      passive: true,
    });

    GM_registerMenuCommand("Minimal X 设置", openSettingsPanel);
    GM_registerMenuCommand("切换 Zen 写作模式", () => {
      setSetting("writerMode", !settings.writerMode);
    });
  }

  initialize();
})();
