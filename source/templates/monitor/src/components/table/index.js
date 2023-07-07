import React, {useEffect, useState} from 'react';
import './style.css';

const Table = ({headers, data, flex}) => {

    const [manyTeams, setManyTeams] = useState(false);
    const [currentTablePageIdx, setCurrentTablePageIdx] = useState(0);
    const [currentPage, setCurrentPage] = useState([]);

    const rabotai = () => {
        let timer;
        if (data.length > 10) {

            let tablePages = [];
            for (let i = 0; i <= data.length; i += 10) {
                if (i + 10 < data.length) {
                    const slicedTeams = data.slice(i, i + 10);
                    tablePages.push(slicedTeams);
                } else if (i !== data.length) {
                    const slicedTeams = data.slice(i, data.length);
                    tablePages.push(slicedTeams);
                }
            }

            if (!manyTeams) {
                if (currentTablePageIdx >= tablePages.length - 1) {
                    setCurrentTablePageIdx(0);
                } else setCurrentTablePageIdx(currentTablePageIdx + 1)
                setCurrentPage(tablePages[currentTablePageIdx]);
            }

            setManyTeams(true);

            timer = setInterval(() => {
                if (currentTablePageIdx >= tablePages.length-1) {
                    setCurrentTablePageIdx(0);
                }
                else setCurrentTablePageIdx(currentTablePageIdx+1)
                setCurrentPage(tablePages[currentTablePageIdx]);
            }, 3000);
        }
        return timer;
    };

    useEffect(() => {
        const timer = rabotai();
        return () => clearInterval(timer);
    }, [currentTablePageIdx, data]);

    return(
        <div className="table">
            <div className="theader">
                { headers.map((header, headerIdx) => (
                    <span style={{'flex': flex[headerIdx]}}>
                        {header}
                    </span>
                ))}
            </div>
            <div className="tbody">
                <div className="tbody__content">
                    { manyTeams
                        ? currentPage.map((rowData, rowIdx) => (
                            <div className="tbody__row">
                                { rowData.map((el, elIdx) => (
                                    <span key={elIdx} style={{'flex': flex[elIdx]}}>{el}</span>
                                ))}
                            </div>
                          ))
                        : data.map((rowData, rowIdx) => (
                            <div className="tbody__row">
                                { rowData.map((el, elIdx) => (
                                    <span key={elIdx} style={{'flex': flex[elIdx]}}>{el}</span>
                                ))}
                            </div>
                        ))
                    }

                    {/*{flex.map((flexVal, colIdx) => (*/}
                    {/*    <div className="tbody__column" style={{'flex': flexVal}}>*/}
                    {/*        { manyTeams*/}
                    {/*            ? currentPage.map(el => (*/}
                    {/*                <span>{el[colIdx]}</span>*/}
                    {/*              ))*/}
                    {/*            : data.map(el => (*/}
                    {/*                <span>{el[colIdx]}</span>*/}
                    {/*              ))*/}
                    {/*        }*/}
                    {/*    </div>*/}
                    {/*))}*/}
                </div>
            </div>
        </div>
    )
}

export default Table;
