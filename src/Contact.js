import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  StyleSheet,
  SafeAreaView,
  BackHandler,
} from 'react-native';
import {Image} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';

const Contact = ({navigation}) => {
  useEffect(() => {
    const handleBackButtonClick = () => {
      if (navigation.canGoBack()) {
        navigation.goBack(); // Navigate to the previous page
        return true; // Prevent default back behavior
      } else {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {text: 'OK', onPress: () => BackHandler.exitApp()},
          ],
          {cancelable: false},
        );
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => {
      backHandler.remove();
    };
  }, []);
  const openDialer = () => {
    Linking.openURL('tel:+9104632294666');
  };
  const openMap = () => {
    Linking.openURL('https://maps.google.com/?q=Your+Office+Location');
  };
  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.body}>
        <Image
          style={styles.welcomeimage}
          source={require('../src/images/5124556.jpg')}
        />
        <View style={styles.SupportContainer}>
          <TouchableOpacity onPress={openDialer}>
            <View style={styles.supportbox}>
              <Image
                style={styles.icons}
                source={require('../src/images/call.png')}
              />
              <Text style={[styles.Supportlinks, {color: 'orange'}]}>
                Call Us
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('mailto:info@sazsapps.com')
            }>
            <View style={styles.supportbox}>
              <Image
                style={styles.icons}
                source={require('../src/images/mail.png')}
              />
              <Text style={[styles.Supportlinks, {color: 'violet'}]}>
                Email Us
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/+917666628000')}>
            <View style={styles.supportbox}>
              <Image
                style={styles.icons}
                source={require('../src/images/whatsapp.png')}
              />
              <Text style={[styles.Supportlinks, {color: '#7acf53'}]}>
                Chat
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.container2}>
          <Text style={styles.header}>Stay Connect With Us</Text>
          <View style={styles.social}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://instagram.com/sazs_apps?igshid=OGQ5ZDc2ODk2ZA==',
                )
              }>
              <Image
                style={styles.icons}
                source={require('../src/images/insta.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.facebook.com/profile.php?id=100075849583725&mibextid=ZbWKwL',
                )
              }>
              <Image
                style={styles.icons}
                source={require('../src/images/face.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://twitter.com/your_twitter')
              }>
              <Image
                style={styles.icons}
                source={require('../src/images/twiter.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://www.youtube.com/@sazsapps',
                )
              }>
              <Image
                style={styles.icons}
                source={require('../src/images/youtube.png')}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.header}>Main Branch:</Text>
          <View style={styles.addressbar}>
            <Text style={styles.address}>
              8d,Arunachalampettai Street,{'\n'}Kovilpatti,Tuticorin Dist,{'\n'}
              Tamil Nadu,India.{'\n'}
              www.sazsapps.com
            </Text>
            <View style={styles.map}>
              <TouchableOpacity onPress={openMap}>
                <Image
                  style={styles.map}
                  source={require('../src/images/maplocation.jpeg')}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    width: '100%',
    paddingTop: 10,
    height: '100%',
    backgroundColor: '#dfe3e6',
  },
  welcomeimage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
  },
  header: {
    fontSize: 30,
    color: 'white',
    textAlign: 'center',
    marginVertical: 5,
    fontFamily: 'Agbalumo-Regular',
  },
  container2: {
    backgroundColor: 'rgb(33,109,206)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flexDirection: 'column',
    height: '57%',
    justifyContent: 'space-evenly',
  },
  SupportContainer: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 20,
    justifyContent: 'space-around',
  },
  supportbox: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    width: 100,
    borderColor: 'white',
    borderWidth: 1,
    elevation: 10,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  Supportlinks: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addressbar: {
    flexDirection: 'row',
    height: 120,
    width: 'auto',
    marginHorizontal: 10,
    overflow: 'hidden',
    backgroundColor: '#d6fdff',
    justifyContent: 'space-between',
    borderRadius: 10,
  },
  address: {
    marginLeft: 5,
    fontSize: 16,
    alignItems: 'center',
    color: 'rgb(53,105,173)',
    fontFamily: 'Agbalumo-Regular',
    textAlign: 'left',
    padding: 5,
  },
  social: {
    flexDirection: 'row',
    width: 'auto',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    justifyContent: 'space-evenly',
    backgroundColor: '#d6fdff',
  },
  map: {objectFit: 'fill', width: 130, height: '100%'},
  icons: {
    width: 40,
    height: 40,
    objectFit: 'fill',
  },
});

export default Contact;
