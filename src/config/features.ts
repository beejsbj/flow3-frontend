export interface FeatureFlags {
  autoLayout: boolean;
  nodeConfigModal: boolean; // Controls whether node config appears in modal or inline
  // Add more feature flags here as needed
}

// Developer-only feature flags configuration
const featureFlags: FeatureFlags = {
  autoLayout: false,
  nodeConfigModal: false, // Default to using modal for node configuration
};

// Simple helper to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return featureFlags[feature];
};

// Export the flags object for direct access if needed
export default featureFlags;
