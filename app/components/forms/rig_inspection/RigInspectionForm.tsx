import * as React from 'react';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';
import RigInspectionItem from '../rig_inspection_template/RigInspectionItem';



export default function RigInspectionForm() {
  const state = useAppSelector(state => state.forms.rigInspection);
  const dispatch = useAppDispatch();
  
  return ( 
    <>
      {
        state.fields.map((item, index) => {
          return (
            <RigInspectionItem
              key={index}
              config={item}
              value={item?.value || ""}
              onChange={(value) =>
                dispatch(
                  actions.forms.rigInspection.setField([index, value])
                )
              }
            />
          )
        })
      }
    </>
  );
}
