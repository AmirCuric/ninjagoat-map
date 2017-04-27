import "reflect-metadata";
require("jsdom-global")();
import expect = require("expect.js");
import {IMock, Mock, Times, It} from "typemoq";
import {ReplaySubject, Subject, Observable} from "rx";
import {LatLng, LatLngBounds} from "leaflet";
import MockLayerView from "./fixtures/MockLayerView";
import IMapView from "../scripts/leaflet/IMapView";
import ILayerView from "../scripts/layer/ILayerView";
import LayerBinder from "../scripts/layer/LayerBinder";
import ILayerBinder from "../scripts/layer/ILayerBinder";

describe("Given a layer binder", () => {

    let subject: ILayerBinder;
    let layerView: IMock<ILayerView<any, any>>;
    let data: ReplaySubject<any>;
    let mapView: IMock<IMapView>;
    let viewChanges: Subject<void>;

    beforeEach(() => {
        viewChanges = new Subject<void>();
        mapView = Mock.ofType<IMapView>();
        mapView.setup(m => m.changes()).returns(() => viewChanges);
        data = new ReplaySubject<any>();
        layerView = Mock.ofType<ILayerView<any, any>>(MockLayerView);
        subject = new LayerBinder([layerView.object], mapView.object);
    });

    context("when a layer type is not registered", () => {
        it("should throw an error", () => {
            expect(() => subject.bind(context => data, <any>"InexistentType", null)).to.throwError();
        });
    });

    context("when a layer is shown for the first time", () => {
        it("should be just created", () => {
            subject.bind(context => data, "GeoJSON", {popup: false});

            layerView.verify(g => g.create(It.isValue({popup: false})), Times.once());
        });
    });

    context("when the data gets an update", () => {
        beforeEach(() => {
            data.onNext({markers: []});
            data.onNext({markers: [{id: "8283"}]});
        });
        it("the layer itself should be updated", () => {
            subject.bind(context => data, "GeoJSON", null);

            layerView.verify(g => g.update(It.isValue({markers: []}), It.isValue({markers: [{id: "8283"}]}), It.isAny(), null), Times.once());
        });
    });

    context("when the bounding box changes", () => {
        beforeEach(() => {
            data.onNext({markers: []});
            data.onNext({markers: [{id: "8283"}]});
        });
        it("should reload the source with the new bounding box", () => {
            subject.bind(context => {
                if (!context.bounds) return data;
                return Observable.just(context);
            }, "GeoJSON", null);
            mapView.setup(m => m.getBounds()).returns(() => new LatLngBounds(new LatLng(50, 50), new LatLng(60, 80)));
            mapView.setup(m => m.getZoom()).returns(() => 12);
            viewChanges.onNext(null);

            layerView.verify(g => g.update(It.isAny(), It.isValue({
                bounds: new LatLngBounds(new LatLng(50, 50), new LatLng(60, 80)),
                zoom: 12
            }), It.isAny(), null), Times.once());
        });
    });
});