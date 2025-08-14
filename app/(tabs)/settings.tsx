import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Lock, Moon, Globe, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const settingsItems = [
    {
      icon: Bell,
      title: 'Notifications',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      icon: Moon,
      title: 'Dark Mode',
      type: 'switch',
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
    },
    {
      icon: Lock,
      title: 'Privacy & Security',
      type: 'navigation',
    },
    {
      icon: Globe,
      title: 'Language',
      type: 'navigation',
      subtitle: 'English',
    },
  ];

  const renderSettingItem = (item: any, index: number) => (
    <TouchableOpacity 
      key={index}
      style={styles.settingItem}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <item.icon size={20} color="#007AFF" />
        </View>
        <View>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onValueChange}
            trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
            thumbColor="#fff"
          />
        ) : (
          <ChevronRight size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.settingsSection}>
          {settingsItems.map(renderSettingItem)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  settingsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingRight: {
    alignItems: 'center',
  },
});
