import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';
import RigScreen from '../../screens/authenticated/rig/RigScreen';
import UpdateUserScreen from '../../screens/authenticated/profile/UpdateUserScreen';
import AppBar from '../AppBar';
import { useAppSelector } from '../../redux';


export type IProfileTabParams = {
  ProfileScreen: {
    userId: string,
  };
  RigScreen: undefined;
  UpdateUserScreen: undefined;
}

const Profile = createStackNavigator<IProfileTabParams>();

export default function ProfileTab() {
  const { currentDropzone } = useAppSelector(state => state.global);
  return (
    <Profile.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Profile.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "Profile" }}
        initialParams={{
          userId: currentDropzone?.currentUser?.id,
        }}
      />
      <Profile.Screen name="UpdateUserScreen" component={UpdateUserScreen} options={{ title: "Edit profile" }} />
      <Profile.Screen name="RigScreen" component={RigScreen} options={{ title: "Rig" }} />
    </Profile.Navigator>
  );
}
