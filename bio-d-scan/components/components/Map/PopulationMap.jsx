import React, { Fragment, useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const PopulationMap = () => {
    const [plotDimensions, setPlotDimensions] = useState({ width: 0, height: 0 });
    const [displayedFields, setDisplayedFields] = useState([]);

    // Field A (Upper Left) - Red
    const fieldA = {
        type: 'scattermapbox',
        mode: 'lines',
        lat: [50.575, 50.575, 50.5748, 50.5742, 50.5738, 50.5733, 50.574, 50.575],
        lon: [-3.925, -3.9247, -3.9242, -3.924, -3.924, -3.9245, -3.925, -3.925],
        fill: 'toself',
        fillcolor: 'rgba(255, 0, 0, 0.2)',
        line: { color: 'red', width: 2 },
        name: 'Honey Bee Field',
        meta: 'A',
        hoveron: 'fills',
        hovertemplate: '<b>Field A</b><br>' + 'Honey Bee:     31.6K<br>' + 'Bumble Bee:    2,200<br>' + 'Carpenter Bee: 1,500<br>' + 'Stingless Bee: 800<br>' + '<extra></extra>',
        hoverlabel: {
            bgcolor: 'white',
            font: { family: 'Courier New, monospace', size: 12, color: 'red' },
        },
    };

    // Field B (Upper Right) - Green
    const fieldB = {
        type: 'scattermapbox',
        mode: 'lines',
        lat: [50.575, 50.575, 50.5748, 50.5742, 50.5738, 50.5735, 50.5737, 50.575],
        lon: [-3.9247, -3.924, -3.9235, -3.923, -3.9225, -3.922, -3.923, -3.9247],
        fill: 'toself',
        fillcolor: 'rgba(0, 255, 0, 0.2)',
        line: { color: 'green', width: 2 },
        name: 'Bumble Bee Field',
        meta: 'B',
        hoveron: 'fills',
        hovertemplate: '<b>Field B</b><br>' + 'Honey Bee:     28K<br>' + 'Bumble Bee:    2,500<br>' + 'Carpenter Bee: 1,200<br>' + 'Stingless Bee: 900<br>' + '<extra></extra>',
        hoverlabel: {
            bgcolor: 'white',
            font: { family: 'Courier New, monospace', size: 12, color: 'green' },
        },
    };

    // Field C (Lower Left) - Blue
    const fieldC = {
        type: 'scattermapbox',
        mode: 'lines',
        lat: [50.5735, 50.5732, 50.5728, 50.5725, 50.5723, 50.5725, 50.573, 50.5735],
        lon: [-3.925, -3.9247, -3.9242, -3.9238, -3.924, -3.9245, -3.925, -3.925],
        fill: 'toself',
        fillcolor: 'rgba(0, 0, 255, 0.2)',
        line: { color: 'blue', width: 2 },
        name: 'Carpenter Bee Field',
        meta: 'C',
        hoveron: 'fills',
        hovertemplate: '<b>Field C</b><br>' + 'Honey Bee:     35K<br>' + 'Bumble Bee:    1,800<br>' + 'Carpenter Bee: 1,700<br>' + 'Stingless Bee: 750<br>' + '<extra></extra>',
        hoverlabel: {
            bgcolor: 'white',
            font: { family: 'Courier New, monospace', size: 12, color: 'blue' },
        },
    };

    // Field D (Lower Right) - Orange
    const fieldD = {
        type: 'scattermapbox',
        mode: 'lines',
        lat: [50.5735, 50.5733, 50.573, 50.5725, 50.5722, 50.572, 50.572, 50.5735],
        lon: [-3.922, -3.9217, -3.9215, -3.921, -3.921, -3.9212, -3.9215, -3.922],
        fill: 'toself',
        fillcolor: 'rgba(255, 255, 0, 0.2)',
        line: { color: 'orange', width: 2 },
        name: 'Stingless Bee Field',
        meta: 'D',
        hoveron: 'fills',
        hovertemplate: '<b>Field D</b><br>' + 'Honey Bee:     30K<br>' + 'Bumble Bee:    2,000<br>' + 'Carpenter Bee: 1,400<br>' + 'Stingless Bee: 850<br>' + '<extra></extra>',
        hoverlabel: {
            bgcolor: 'white',
            font: { family: 'Courier New, monospace', size: 12, color: 'orange' },
        },
    };

    const allFields = [fieldA, fieldB, fieldC, fieldD];

    useEffect(() => {
        const calculateDimensions = () => {
            const width = window.innerWidth * 0.98;
            const mobileHeight = window.innerHeight * 0.3;
            const desktopHeight = window.innerHeight * 0.5;
            const height = window.innerWidth < 950 ? mobileHeight : desktopHeight;
            setPlotDimensions({ width, height });
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);

        // Check URL and filter fields
        const pathSegments = window.location.pathname.split('/');
        const fieldIndex = pathSegments.indexOf('field');

        if (fieldIndex !== -1 && pathSegments[fieldIndex + 1]) {
            const selectedFieldId = pathSegments[fieldIndex + 1];
            const filteredFields = allFields.filter((field) => field.meta === selectedFieldId);
            setDisplayedFields(filteredFields);
        } else {
            setDisplayedFields(allFields);
        }

        return () => window.removeEventListener('resize', calculateDimensions);
    }, []);

    // Event handler for clicks on the fields.
    const handleClick = (event) => {
        if (event.points && event.points.length > 0) {
            const fieldID = event.points[0].data.meta;
            if (fieldID) {
                window.location.href = `/dashboard/field/${fieldID}`;
            }
        }
    };

    return (
        <Fragment>
            <div
                style={{
                    minHeight: `${plotDimensions.height}px`,
                    minWidth: '100vw',
                    height: `${plotDimensions.height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Plot
                    style={{
                        minHeight: `${plotDimensions.height}px`,
                        minWidth: '100vw',
                        height: `${plotDimensions.height}px`,
                        width: '100%',
                    }}
                    data={displayedFields}
                    layout={{
                        width: plotDimensions.width,
                        height: plotDimensions.height,
                        autosize: true,
                        hovermode: 'closest',
                        mapbox: {
                            style: 'open-street-map',
                            center: { lat: 50.5735, lon: -3.9225 },
                            zoom: 15,
                        },
                        showlegend: true,
                        margin: { t: 0, r: 0, b: 0, l: 0 },
                        hoverlabel: {
                            bgcolor: 'white',
                            font: { family: 'Courier New, monospace', size: 12 },
                        },
                    }}
                    config={{
                        scrollZoom: true,
                        displayModeBar: true,
                    }}
                    onClick={handleClick}
                />
            </div>
        </Fragment>
    );
};

export default PopulationMap;
