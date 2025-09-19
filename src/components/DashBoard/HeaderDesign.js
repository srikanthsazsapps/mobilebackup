import React, {useState} from "react";
import { StyleSheet, View , ImageBackground, Text, TouchableOpacity} from "react-native";

const HeaderDesign = () => {

    const [dateTab, setDateTab] = useState('Custom');
      const tabs = ['YDay', 'Today', 'Week', 'Month', 'Custom'];
    return(
         <View style={styles.Container}>
            <View style={styles.header}>
                    <ImageBackground
                      source={require('../../images/LogoWaterMark.png')}
                      style={styles.headerImage}
                      resizeMode="contain"
                    />
                    <View style={styles.headerContent}></View>
            
                    <View style={styles.Sortcontainer}>
                      {tabs.map((tab, index) => (
                        <React.Fragment key={tab}>
                          <TouchableOpacity
                            style={[
                              styles.tab,
                              dateTab === tab && styles.dateTab, 
                              index === 0 && styles.firstTab, 
                              index === tabs.length - 1 && styles.lastTab,
                            ]}
                            onPress={() => setDateTab(tab)}
                          >
                            <Text
                              style={[
                                styles.tabText,
                                dateTab === tab && styles.activeTabText, 
                              ]}
                            >
                              {tab}
                            </Text>
                          </TouchableOpacity>
                          {index < tabs.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                      ))}
                    </View>
                  </View>
            
                  {/* Profit Card */}
                  <View style={styles.profitCard}>
                    </View>
                  </View>
            
        
    );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
    
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    left: 65,
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 35,
    marginLeft: 35,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 15,
    color: 'white',
  },
  
  Sortcontainer: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2', 
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2, 
    borderColor: '#FFFFFF', 
    marginTop: 40,
    marginHorizontal: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTab: {
    backgroundColor: '#FFFFFF', 
  },
  firstTab: {
    borderTopLeftRadius: 8, 
    borderBottomLeftRadius: 8,
  },
  lastTab: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8, 
  },
  tabText: {
    color: '#FFFFFF', 
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#000000', 
  },
  divider: {
    width: 1,
    backgroundColor: '#FFFFFF', 
    height: '100%', 
  },

  profitCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 40,
    height:200,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginTop: -90,
  },
  
  

})


export default HeaderDesign;