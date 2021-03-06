import {ObservableLayer} from "../layer/ObservableLayer";
import {GeoJSONProps, GeoJSONCollection, GeoJSONFeature} from "../geojson/GeoJSONProps";
import {lazyInject} from "ninjagoat";
import IMapHolder from "../leaflet/IMapHolder";
import {Circle, LayerGroup} from "leaflet";
import {map} from "lodash";
import IShapeTransformer from "./IShapeTransformer";

export type DrawingLayerProps = GeoJSONProps & {onChange: (shapes: GeoJSONCollection) => void};

export class DrawingLayer extends ObservableLayer<DrawingLayerProps> {

    @lazyInject("IMapHolder")
    private mapHolder: IMapHolder;
    @lazyInject("IShapeTransformer")
    private shapeTransformer: IShapeTransformer;

    getLayerType(props: GeoJSONProps): string {
        return "Drawing";
    }

    componentDidMount() {
        super.componentDidMount();
        let map = this.mapHolder.obtainMap();
        map.on(L.Draw.Event.CREATED, this.notifyShapes.bind(this));
        map.on(L.Draw.Event.EDITED, this.notifyShapes.bind(this));
        map.on(L.Draw.Event.DELETED, this.notifyShapes.bind(this));
    }

    private notifyShapes() {
        this.props.onChange({
            "type": "FeatureCollection",
            "features": this.combineShapes()
        });
    }

    private combineShapes(): GeoJSONFeature[] {
        let layers = (this.layer as LayerGroup).getLayers();
        return map(layers, (shape: any) => {
            let geojson = shape.toGeoJSON();
            if (shape instanceof Circle)
                geojson.properties.radius = shape.getRadius();
            return this.shapeTransformer.transform(geojson);
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        let map = this.mapHolder.obtainMap();
        map.off(L.Draw.Event.CREATED);
        map.off(L.Draw.Event.EDITED);
        map.off(L.Draw.Event.DELETED);
    }
}