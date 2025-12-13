"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Sun,
  Moon,
  Wallet,
  LogOut,
  FileText,
  Gamepad2,
  Wrench,
  Volume2,
  VolumeX,
  Send,
  Twitter,
  Instagram,
} from "lucide-react";
import type { WalletState } from "../types";
import { useLanguage } from "../lib/language-context";
import LanguageSelector from "./LanguageSelector";
import SeasonSelector, { type Season } from "./SeasonSelector";

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const DiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m386 137c-24-11-49.5-19-76.3-23.7c-.5 0-1 0-1.2.6c-3.3 5.9-7 13.5-9.5 19.5c-29-4.3-57.5-4.3-85.7 0c-2.6-6.2-6.3-13.7-10-19.5c-.3-.4-.7-.7-1.2-.6c-23 4.6-52.4 13-76 23.7c-.2 0-.4.2-.5.4c-49 73-62 143-55 213c0 .3.2.7.5 1c32 23.6 63 38 93.6 47.3c.5 0 1 0 1.3-.4c7.2-9.8 13.6-20.2 19.2-31.2c.3-.6 0-1.4-.7-1.6c-10-4-20-8.6-29.3-14c-.7-.4-.8-1.5 0-2c2-1.5 4-3 5.8-4.5c.3-.3.8-.3 1.2-.2c61.4 28 128 28 188 0c.4-.2.9-.1 1.2.1c1.9 1.6 3.8 3.1 5.8 4.6c.7.5.6 1.6 0 2c-9.3 5.5-19 10-29.3 14c-.7.3-1 1-.6 1.7c5.6 11 12.1 21.3 19 31c.3.4.8.6 1.3.4c30.6-9.5 61.7-23.8 93.8-47.3c.3-.2.5-.5.5-1c7.8-80.9-13.1-151-55.4-213c0-.2-.3-.4-.5-.4Zm-192 171c-19 0-34-17-34-38c0-21 15-38 34-38c19 0 34 17 34 38c0 21-15 38-34 38zm125 0c-19 0-34-17-34-38c0-21 15-38 34-38c19 0 34 17 34 38c0 21-15 38-34 38z"/>
  </svg>
);

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface HeaderProps {
  walletState?: WalletState;
  onConnectClick?: () => void;
  onDisconnectClick?: () => void;
  onSwapClick?: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onToolsClick?: () => void;
  onGamesClick?: () => void;
  onWhitepaperClick?: () => void;
  season: Season;
  onSeasonChange: (season: Season) => void;
  isChatOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  walletState,
  onConnectClick,
  onDisconnectClick,
  onSwapClick,
  soundEnabled,
  toggleSound,
  onToolsClick,
  onGamesClick,
  onWhitepaperClick,
  season,
  onSeasonChange,
  isChatOpen = false,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Aguardar montagem do componente no cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setIsDark(currentTheme === "dark");

    // Otimização: usar requestAnimationFrame para scroll suave
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark ? "dark" : "light";
    setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const navLinks = [
    { name: t("nav.home"), href: "#hero" },
    { name: t("nav.tokenomics"), href: "#overview" },
    { name: t("nav.community"), href: "#community" },
    { name: t("nav.miaoAi"), href: "#generator" },
    { name: t("nav.nfts"), href: "#nfts" },
  ];

  // Ocultar navbar quando chat está aberto (após hidratação)
  if (isMounted && isChatOpen) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 overflow-visible ${
          scrolled ? "backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
        style={{
          top: "var(--disclaimer-banner-height, 0px)",
        }}
        style={
          scrolled
            ? {
                backgroundColor: "var(--bg-primary)",
                opacity: 0.95,
              }
            : {}
        }
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 relative overflow-visible">
          <div className="flex items-center justify-between h-20 overflow-visible flex-nowrap min-w-0">
            {/* Left: Logo + Nav Links */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Logo visível apenas após scroll */}
              <a
                href="#hero"
                className={`flex items-center group h-full transition-opacity duration-300 flex-shrink-0 ${
                  scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                title="MIAO — Solana memecoin home"
              >
                <img
                  src="/logo.png"
                  alt="MIAO — The Green Cat Token on Solana"
                  className="h-10 w-auto object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </a>

              {/* Desktop Nav Links */}
              <div
                className="hidden lg:flex items-center gap-0.5 bg-[var(--bg-secondary)] rounded-xl p-1 border-2 border-[var(--border-color)] flex-shrink-0 h-11"
                style={{ direction: "ltr" }}
              >
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-3 h-full rounded-lg font-bold text-sm uppercase tracking-wide text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all whitespace-nowrap flex items-center justify-center flex-shrink-0"
                    title={`MIAO Solana memecoin — ${link.name}`}
                    style={{ direction: "ltr", textAlign: "center" }}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right Controls */}
            <div className="hidden lg:flex flex-col items-end gap-2 overflow-visible flex-shrink-0">
              <div className="flex items-center gap-2 overflow-visible flex-nowrap">
                <div className="flex-shrink-0">
                  <LanguageSelector compact />
                </div>

                <div className="flex-shrink-0">
                  <SeasonSelector
                    season={season}
                    onSeasonChange={onSeasonChange}
                  />
                </div>

                <button
                  onClick={toggleTheme}
                  className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-yellow)] active:border-b-2 active:translate-y-0.5 transition-all flex-shrink-0"
                  aria-label="Toggle Theme"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button
                  onClick={toggleSound}
                  className={`w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-0.5 flex flex-shrink-0 ${
                    soundEnabled
                      ? "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-green)]"
                      : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]"
                  }`}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>

                {walletState?.isConnected ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={onSwapClick}
                      className="h-11 px-5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)] flex-shrink-0">
                      <span className="text-[var(--duo-green)] font-mono font-bold text-sm whitespace-nowrap">
                        {walletState.address?.slice(0, 4)}...
                        {walletState.address?.slice(-4)}
                      </span>
                      <button
                        onClick={onDisconnectClick}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] transition-all flex-shrink-0"
                        title={t("header.disconnect")}
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile/Tablet Controls */}
            <div className="flex lg:hidden items-center gap-2 ml-auto overflow-visible">
              <LanguageSelector compact />

              <SeasonSelector
                season={season}
                onSeasonChange={onSeasonChange}
                compact
              />

              <button
                onClick={toggleTheme}
                className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] border-b-4 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-yellow)] active:border-b-2 active:translate-y-0.5 transition-all"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={toggleSound}
                className={`hidden md:flex w-11 h-11 rounded-2xl border-2 border-b-4 items-center justify-center transition-all active:border-b-2 active:translate-y-0.5 ${
                  soundEnabled
                    ? "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--duo-green)]"
                    : "bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-muted)]"
                }`}
                aria-label="Toggle Sound"
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <div className="hidden md:block">
                {walletState?.isConnected ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onSwapClick}
                      className="h-11 px-5 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      {t("header.buy")}
                    </button>
                    <div className="flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
                      <span className="text-[var(--duo-green)] font-mono font-bold text-sm">
                        {walletState.address?.slice(0, 4)}...
                        {walletState.address?.slice(-4)}
                      </span>
                      <button
                        onClick={onDisconnectClick}
                        className="w-7 h-7 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] transition-all"
                        title={t("header.disconnect")}
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={onConnectClick}
                    className="h-11 px-6 rounded-2xl font-bold text-sm uppercase tracking-wide bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] hover:brightness-105 active:border-b-2 active:translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Wallet size={18} />
                    {t("header.connect")}
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="w-11 h-11 rounded-2xl bg-[var(--duo-green)] border-2 border-b-4 border-[var(--btn-shadow)] flex items-center justify-center text-white active:border-b-2 active:translate-y-0.5 transition-all"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-80 bg-[var(--bg-primary)] flex flex-col animate-fade-left shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b-2 border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="MIAO"
                  className="w-10 h-10 object-contain"
                  loading="lazy"
                />
                <span className="text-xl font-black text-[var(--text-primary)]">
                  {t("nav.menu")}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] active:border-b-2 active:translate-y-[2px] transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="flex-1 p-5 space-y-2 overflow-y-auto"
              style={{ direction: "ltr" }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
                  style={{ direction: "ltr", textAlign: "left" }}
                >
                  {link.name}
                </a>
              ))}

              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-gray-400 cursor-not-allowed opacity-50"
                style={{ direction: "ltr", textAlign: "left" }}
              >
                <Wrench size={20} />
                {t("nav.tools")}
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-gray-400 cursor-not-allowed opacity-50"
                style={{ direction: "ltr", textAlign: "left" }}
              >
                <Gamepad2 size={20} />
                {t("nav.games")}
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold text-gray-400 cursor-not-allowed opacity-50"
                style={{ direction: "ltr", textAlign: "left" }}
              >
                <FileText size={20} />
                {t("nav.whitepaper")}
              </button>

              <hr className="my-4 border-2 border-[var(--border-color)]" />

              <div className="px-4 py-3">
                <LanguageSelector />
              </div>

              <div className="px-4 py-3">
                <SeasonSelector
                  season={season}
                  onSeasonChange={onSeasonChange}
                />
              </div>

              <button
                onClick={() => {
                  toggleSound();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-bold transition-all ${
                  soundEnabled
                    ? "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                }`}
              >
                {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
                Sound: {soundEnabled ? "ON" : "OFF"}
              </button>
            </div>

            <div className="p-5 border-t-2 border-[var(--border-color)] space-y-3">
              {walletState?.isConnected ? (
                <>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--duo-green)]">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
                      {t("header.connected")}
                    </p>
                    <p className="font-mono font-black text-[var(--duo-green)] truncate">
                      {walletState.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onSwapClick?.();
                      }}
                      className="flex-1 py-4 rounded-xl font-bold text-base uppercase bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] active:border-b-2 active:translate-y-[2px] transition-all"
                    >
                      {t("header.buy")}
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onDisconnectClick?.();
                      }}
                      className="w-14 rounded-xl bg-[var(--bg-secondary)] border-2 border-b-4 border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--duo-red)] active:border-b-2 active:translate-y-[2px] transition-all"
                      title={t("header.disconnect")}
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onConnectClick?.();
                  }}
                  className="w-full py-4 rounded-xl font-bold text-base uppercase bg-[var(--duo-green)] text-white border-2 border-b-4 border-[var(--btn-shadow)] active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={20} />
                  {t("header.connectWallet")}
                </button>
              )}

              {/* Version */}
              <div className="px-4 py-2 border-t-2 border-[var(--border-color)]">
                <p className="text-xs font-medium text-[var(--text-secondary)] text-center">
                  v1.2.0
                </p>
              </div>

              {/* Social Media Buttons - Only in menu when very tight */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 border-t-2 border-[var(--border-color)]">
                <a
                  href="https://t.me/miaotokensol"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Send size={26} />
                </a>
                <a
                  href="https://x.com/miaoonsol"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Twitter size={26} />
                </a>
                <a
                  href="https://www.instagram.com/miaodotarmy"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <Instagram size={26} />
                </a>
                <a
                  href="https://www.tiktok.com/@miaodotarmy"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <TikTokIcon size={26} />
                </a>
                <a
                  href="https://www.facebook.com/miaodotarmy"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                >
                  <FacebookIcon size={26} />
                </a>
                <a
                  href="https://discord.gg/J57VTQh2hX"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                  title="Discord"
                >
                  <DiscordIcon size={26} />
                </a>
                <a
                  href="https://www.youtube.com/@miaodotarmy"
                  target="_blank"
                  rel="noopener nofollow"
                  className="w-14 h-14 rounded-lg flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                  title="YouTube"
                >
                  <YoutubeIcon size={26} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
