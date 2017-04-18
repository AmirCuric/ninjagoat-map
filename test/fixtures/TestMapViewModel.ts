import MapViewModel from "../../scripts/MapViewModel";
import ILayerPresenter from "../../scripts/interfaces/ILayerPresenter";
import {Dictionary} from "ninjagoat";
import {MapObservableFactory} from "../../scripts/LayerRegistration";
import {Observable} from "rx";

class TestMapViewModel extends MapViewModel<any> {

    private sources = {
        "foo": context => Observable.empty(),
        "bar": context => Observable.empty()
    };

    constructor(layerPresenter: ILayerPresenter) {
        super(layerPresenter);
    }

    protected onData(data: any): void {
    }

    defineSources(): Dictionary<MapObservableFactory<any>> {
        return this.sources;
    }

}

export default TestMapViewModel