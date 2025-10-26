import { Injectable } from "@angular/core";
import { ApiCoreService } from "../../api/api-core/api-core.service";
import { InternalStorageCoreService } from "../internal-storage-core/internal-storage-core.service";
import { ICoin } from "src/app/models/coin.model";
import { StorageKeys } from "../../constants";

@Injectable({
    providedIn: 'root'
})
export class LocalCoinService extends InternalStorageCoreService<ICoin>{
    constructor(){
        super(StorageKeys.COINS);
    }

    public override async insert(obj: ICoin) {
        throw new Error("Not allowed");
    }
    public override async update(obj: ICoin) {
        throw new Error("Not allowed");
    }
    public override async delete(obj: ICoin) {
        throw new Error("Not allowed");
    }
    public override async deactivate(obj: ICoin) {
        throw new Error("Not allowed");
    }
}