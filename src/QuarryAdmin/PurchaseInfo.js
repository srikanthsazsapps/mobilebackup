import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Card} from 'react-native-paper';

const PurchaseInfo = ({title, weight, trips}) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text style={[styles.title]}>{title}</Text>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
        <View>
          <Text style={styles.value}>
            <Text style={styles.Key}>Trips : </Text>
            {trips}
          </Text>
        </View>
        <Text style={[styles.value, {alignSelf: 'flex-start'}]}>
          <Text style={styles.Key}>MT : </Text>
          {weight}
        </Text>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 15,
    marginBottom: 5,
    color: 'black',
    fontFamily: 'Cabin-Bold',
  },
  value: {
    marginBottom: 5,
    fontSize: 15,
    fontFamily: 'Cabin-Bold',

    color: 'black',
  },
  Key: {
    fontFamily: 'Cabin-Bold',
    fontSize: 14,
  },
});

export default PurchaseInfo;
