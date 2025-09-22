import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const VehiclePopupCard = ({ visible, activeTab, onClose, vehicleData }) => {
  if (!visible) return null;

  const getCurrentVehicles = () => {
    const vehicles = vehicleData[activeTab] || [];
    console.log(`Vehicles for ${activeTab}:`, vehicles); // Log for debugging
    return vehicles;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit':
        return '#4CAF50';
      case 'Idle Vehicle':
        return '#FF5722';
      case 'In Workshop':
        return '#FFC107';
      case 'FC Ending':
        return '#9C27B0';
      case 'Permit':
        return '#FF9800';
      case 'Tax':
        return '#F44336';
      case 'Insurance':
        return '#2196F3';
      case 'Highly used vehicle':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateDaysRemaining = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const expiryDate = new Date(dateString);
      const now = new Date('2025-08-14T18:53:00Z'); // 06:53 PM IST, August 14, 2025
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        return `${diffDays} days remaining`;
      } else if (diffDays === 0) {
        return 'Expires today';
      } else {
        return `Expired ${Math.abs(diffDays)} days ago`;
      }
    } catch (error) {
      return 'N/A';
    }
  };

  const renderVehicleDetails = (vehicle) => {
    console.log(`Rendering details for ${activeTab}:`, vehicle); // Debug log for each vehicle
    switch (activeTab) {
      case 'Highly used vehicle':
        return (
          <View style={styles.vehicleDetails}>
            <Text style={styles.detailText}>Vehicle Number: {vehicle.number || 'N/A'}</Text>
            <Text style={styles.detailText}>Trips: {vehicle.tripCount || 'N/A'}</Text>
          </View>
        );
      case 'FC Ending':
      case 'Permit':
      case 'Tax':
      case 'Insurance':
        const dateField = activeTab === 'FC Ending' ? 'fcDate' :
                         activeTab === 'Permit' ? 'permitDate' :
                         activeTab === 'Tax' ? 'taxDate' :
                         'insuranceDate';
        return (
          <View style={styles.vehicleDetails}>
            <Text style={styles.detailText}>Vehicle Number: {vehicle.number || 'N/A'}</Text>
            <Text style={styles.detailText}>Expiry Date: {formatDate(vehicle[dateField]) || 'N/A'} ({calculateDaysRemaining(vehicle[dateField]) || 'N/A'})</Text>
          </View>
        );
      default:
        return (
          <View style={styles.vehicleDetails}>
            <Text style={styles.detailText}>No details available</Text>
          </View>
        );
    }
  };

  const vehicles = getCurrentVehicles();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popupContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{activeTab}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesomeIcon icon={faTimes} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.countText}>
              Total Vehicles: {vehicles.length}
            </Text>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <View key={`${vehicle.id}-${index}`} style={styles.vehicleCard}>
                    <View style={styles.vehicleHeader}>
                      <View style={styles.vehicleIconContainer}>
                        <View style={[styles.vehicleIcon, { backgroundColor: getStatusColor(vehicle.status) }]}>
                          <Text style={styles.vehicleIconText}>🚛</Text>
                        </View>
                        <View style={styles.vehicleBasicInfo}>
                          <Text style={styles.vehicleNumber}>{vehicle.number || 'N/A'}</Text>
                          <Text style={styles.vehicleStatus}>{vehicle.status || 'N/A'}</Text>
                        </View>
                      </View>
                    </View>
                    {renderVehicleDetails(vehicle)}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No vehicles found for {activeTab}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  vehicleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vehicleHeader: {
    marginBottom: 10,
  },
  vehicleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleIconText: {
    fontSize: 18,
  },
  vehicleBasicInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  vehicleStatus: {
    fontSize: 14,
    color: '#666',
  },
  vehicleDetails: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'column', // Ensure vertical stacking
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 18,
    opacity: 1, // Ensure text is visible
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default VehiclePopupCard;