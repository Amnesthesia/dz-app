import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { useAppSelector } from '../../../redux';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import useRestriction from '../../../hooks/useRestriction';
import { Permission } from '../../../graphql/schema.d';




export default function SettingsScreen() {  
  const navigation = useNavigation();
  const state = useAppSelector(state => state.global);

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  return (
    <ScrollableScreen>
      <List.Section title="Dropzone" style={{ width: "100%" }}>
        {!canUpdateDropzone ? null : (
          <List.Item
            title="Configuration"
            onPress={() => navigation.navigate("UpdateDropzoneScreen", { dropzone: state.currentDropzone })}
            left={() => <List.Icon color="#000" icon="information-outline" />}
            description="Set up name, branding and other settings"
          />
        )}
        <List.Item
          title="Permissions"
          left={() => <List.Icon color="#000" icon="lock" />}
          onPress={() => navigation.navigate("DropzonePermissionScreen")}
        />
        <List.Item
          title="Aircrafts"
          onPress={() => navigation.navigate("PlanesScreen")}
          left={() => <List.Icon color="#000" icon="airplane" />}
        />
        <List.Item
          title="Rigs"
          left={() => <List.Icon color="#000" icon="parachute" />}
          description="Dropzone rigs, e.g tandems and student rigs"
          onPress={() => navigation.navigate("DropzoneRigsScreen")}
        />
        <List.Item
          disabled={!canUpdateRigInspectionTemplate}
          title="Rig Inspection Template"
          left={() => <List.Icon color="#000" icon="check" />}
          onPress={() => navigation.navigate("RigInspectionTemplateScreen")}
        />
        <List.Item
          title="Master Log"
          left={() => <List.Icon color="#000" icon="parachute" />}
          description="View historic data for daily operations"
          onPress={() => navigation.navigate("DropzoneMasterLogScreen")}
        />
      </List.Section>

      <List.Section title="Tickets" style={{ width: "100%" }}>
        <List.Item
          title="Ticket types"
          onPress={() => navigation.navigate("TicketTypesScreen")}
          left={() => <List.Icon color="#000" icon="ticket" />}
          description="Manage ticket prices and accessibility"
          />
        <List.Item
          title="Ticket add-ons"
          onPress={() => navigation.navigate("ExtrasScreen")}
          left={() => <List.Icon color="#000" icon="plus" />}
          description="Supplementary tickets like coach, camera, night jumpi"
        />
      </List.Section>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex"
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
