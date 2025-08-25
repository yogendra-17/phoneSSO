import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Lock, Moon, Globe, ChevronRight, Bug, Wifi, Shield, Wallet } from 'lucide-react-native';
import { debugOrchestratorState, clearOrchestratorAuth, checkNetworkConnectivity } from '../../utils/debugUtils';
import { debugFirebaseConfig } from '../../utils/firebaseDebug';
import { testWalletCreation } from '../../utils/walletTest';
import { testCompleteFlow } from '../../utils/flowTest';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const debugItems = [
    {
      icon: Bug,
      title: 'Debug Orchestrator State',
      type: 'action',
      action: () => {
        debugOrchestratorState();
        Alert.alert('Debug', 'Check console for orchestrator state');
      },
    },
    {
      icon: Shield,
      title: 'Debug Firebase Config',
      type: 'action',
      action: () => {
        debugFirebaseConfig();
        Alert.alert('Debug', 'Check console for Firebase configuration');
      },
    },
    {
      icon: Wifi,
      title: 'Test Network Connectivity',
      type: 'action',
      action: async () => {
        await checkNetworkConnectivity();
        Alert.alert('Debug', 'Check console for network connectivity results');
      },
    },
    {
      icon: Wallet,
      title: 'Test Wallet Creation',
      type: 'action',
      action: async () => {
        const result = await testWalletCreation();
        Alert.alert('Debug', result.success ? 'Wallet creation test successful! Check console for details.' : `Wallet creation test failed: ${result.error}`);
      },
    },
    {
      icon: Bug,
      title: 'Test Complete Flow',
      type: 'action',
      action: async () => {
        const result = await testCompleteFlow();
        Alert.alert('Debug', result.success ? 'Complete flow test successful! Check console for details.' : `Complete flow test failed: ${result.error}`);
      },
    },
    {
      icon: Lock,
      title: 'Clear Orchestrator Auth',
      type: 'action',
      action: () => {
        clearOrchestratorAuth();
        Alert.alert('Debug', 'Orchestrator authentication cleared');
      },
    },
  ];

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
      onPress={item.type === 'action' ? item.action : undefined}
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
          <Text style={styles.sectionTitle}>Debug Tools</Text>
          {debugItems.map(renderSettingItem)}
        </View>
        
        <View style={[styles.settingsSection, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>General Settings</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
