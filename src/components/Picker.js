import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import {getStoredData} from './common/AsyncStorage';
import {DataContext} from './common/DataContext';

const {width} = Dimensions.get('window');

const CompanyList = ({onSelect}) => {
  const [companyList, setCompanyList] = useState([]);
  const {selectedCompany, setSelectedCompany, RefreshData} =
    useContext(DataContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const localData = await getStoredData('CompanyDetails');
        if (localData && localData.length > 0) {
          const formattedData = [
            {label: 'All Branches', value: 0},
            ...localData.map(company => ({
              label: company.Webkey,
              value: company.id,
            })),
          ];
          setCompanyList(formattedData);
        }
      } catch (error) {
        console.error('Error fetching stored data: ', error);
      }
    };
    fetchData();
  }, []);

  const handleSelectCompany = value => {
    setSelectedCompany(value);
    RefreshData();
    onSelect();
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        item.value === selectedCompany && styles.selectedItem,
      ]}
      onPress={() => handleSelectCompany(item.value)}>
      <Text
        style={[
          styles.itemText,
          item.value === selectedCompany && styles.selectedText,
        ]}>
        {item.label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={companyList}
        keyExtractor={item => item.value.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  listContent: {
    paddingBottom: 10,
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedItem: {
    backgroundColor: '#3E89EC',
    borderColor: '#3E89EC',
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
    color: 'grey',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default CompanyList;
