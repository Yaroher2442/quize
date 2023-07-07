import React from 'react';
import './style.css';
import {AppStore} from "utils";

const Table = ({headers, data, clickable, flex}) => {

    const {
        accentColor,
        teamName,
    } = AppStore.useState(s => ({
        accentColor: s.accentColor,
        teamName: s.teamName,
    }));

    const getTeamStyle = (currName, elIdx) => {
        const style = {
            flex: flex[elIdx],
            color: 'black',
        };
        if (currName === teamName ){
            style.color = accentColor;
            style.fontWeight = 'bold';
        };
        return style
    };

    return(
        <div className="table">
            <div className="theader">
                { headers.map((title, idx) => (<>
                    <span key={idx} style={{'flex': flex[idx]}}>{title}</span>
                </>))}
            </div>
            <div className="tbody">
                <div className="tbody__content">
                    { data.map((rowData, rowIdx) => (
                        <div className="tbody__row"  key={rowIdx}>
                            { rowData.map((el, elIdx) => (
                                <span key={elIdx} style={getTeamStyle(rowData[1], elIdx)}>{el}</span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Table;
