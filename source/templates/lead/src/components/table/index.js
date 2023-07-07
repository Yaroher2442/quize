import React, {useEffect, useState} from 'react';
import './style.css';
import editRow from '../../assets/editRow.png'
import editingRow from '../../assets/editingRow.png'
import renameTeam from '../../assets/renameTeam.png'
import deleteTeam from '../../assets/deleteTeam.png'
import {
    Menu,
    MenuItem,
    MenuButton
} from '@szhsin/react-menu';
import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const Table = ({openModal=()=>{}, headers, data, isEditing, flex, interactiveResults=false}) => {

    const [editingRowIdx, setEditingRowIdx] = useState(null);

    const clickRowEdit = (rowIdx) => {
        if (editingRowIdx === rowIdx) setEditingRowIdx(null);
        else setEditingRowIdx(rowIdx);
    };

    return(
        <div className="table">
            <div className="theader">
                { headers.map((title, idx) => (<>
                    <span key={idx} style={{'flex': flex[idx]}}>{title}</span>
                    {idx < flex.length - 1 && <div className="tbody__divider"/>}
                </>))}
            </div>
            <div className="tbody">
                <div className="tbody__content">
                    { data.map((rowData, rowIdx) => (
                        <div className="tbody__row">
                            { rowData.map((el, elIdx) => {
                                if (interactiveResults && elIdx === rowData.length-1) {
                                    return <span key={elIdx} style={{'flex': flex[elIdx], 'textDecoration': 'underline'}} onClick={() => openModal(rowData[1], 'results')}>{el}</span>
                                } else {
                                    return <span key={elIdx} style={{'flex': flex[elIdx]}}>{el}</span>
                                }
                            })}
                            {isEditing &&
                                <Menu
                                    menuClassName={'tedit'}
                                    onMenuChange={() => clickRowEdit(rowIdx)}
                                    transition={true}
                                    arrow={true}
                                    menuButton={
                                        <MenuButton className={'tedit__opener'}>
                                            <img src={editingRowIdx === rowIdx ? editingRow : editRow} alt="editbutton"/>
                                        </MenuButton>
                                    }
                                >
                                    <MenuItem className={'tedit__item'} onClick={() => openModal(rowData[1], 'rename')}>
                                        <img src={renameTeam} alt="renameTeam"/>
                                        <p>Переименовать</p>
                                    </MenuItem>
                                    <MenuItem className={'tedit__item'} onClick={() => openModal(rowData[1], 'delete')}>
                                        <img src={deleteTeam} alt="deleteTeam"/>
                                        <p>Удалить</p>
                                    </MenuItem>
                                </Menu>
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Table;
