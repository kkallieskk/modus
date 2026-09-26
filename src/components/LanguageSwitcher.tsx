import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { Globe, ChevronDown } from 'lucide-react-native';

const LANGUAGES = [
  { code: 'en', label: 'En', name: 'English' },
  { code: 'hi', label: 'Hi', name: 'Hindi' },
  { code: 'bn', label: 'Bn', name: 'Bengali' },
  { code: 'te', label: 'Te', name: 'Telugu' },
  { code: 'mr', label: 'Mr', name: 'Marathi' },
  { code: 'ta', label: 'Ta', name: 'Tamil' },
  { code: 'ur', label: 'Ur', name: 'Urdu' },
  { code: 'gu', label: 'Gu', name: 'Gujarati' },
  { code: 'kn', label: 'Kn', name: 'Kannada' },
  { code: 'ml', label: 'Ml', name: 'Malayalam' },
  { code: 'pa', label: 'Pa', name: 'Punjabi' },
  { code: 'or', label: 'Or', name: 'Odia' },
  { code: 'as', label: 'As', name: 'Assamese' },
];

export const LanguageSwitcher = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);


  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    if (Platform.OS === 'web') {
      try {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (combo) {
          combo.value = langCode;
          // Modern event dispatch
          let event;
          if (typeof window.Event === 'function') {
            event = new window.Event('change', { bubbles: true, cancelable: true });
          } else {
            event = document.createEvent('HTMLEvents');
            event.initEvent('change', true, true);
          }
          combo.dispatchEvent(event);
        } else {
          console.warn('Google Translate combo box not found yet.');
        }
      } catch (err) {
        console.error('Translation failed', err);
      }
    }
  };

  const activeLang = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <View style={{ zIndex: 9999 }}>
      <TouchableOpacity 
        style={styles.triggerBtn} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Globe size={16} color="#0F172A" />
        <Text style={styles.triggerText}>{activeLang.label}</Text>
        <ChevronDown size={14} color="#64748B" style={{ marginLeft: 2 }} />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity 
              key={lang.code}
              style={[styles.langItem, currentLang === lang.code && styles.langItemActive]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={[styles.langText, currentLang === lang.code && styles.langTextActive]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 4,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxHeight: 300,
        overflowY: 'auto',
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }
    })
  },
  langItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  langItemActive: {
    backgroundColor: '#F1F5F9',
  },
  langText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  langTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
