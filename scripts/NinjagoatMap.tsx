import * as React from "react";
import {Map} from "react-leaflet";
import {lazyInject} from "ninjagoat";
import IMapHolder from "./leaflet/IMapHolder";

class NinjagoatMap extends React.Component<void, void> {

    @lazyInject("IMapHolder")
    private mapHolder: IMapHolder;

    render() {
        return <Map center={[0, 0]} zoom={1} ref={component => this.mapHolder.setMap(component.leafletElement)}>
            {this.props.children}
        </Map>;
    }
}

export default NinjagoatMap