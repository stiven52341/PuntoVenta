import { Injectable } from "@angular/core";
import { ApiCoreService } from "../api-core/api-core.service";
import { ICoin } from "src/app/models/coin.model";
import { ApiKeys } from "../../constants";

@Injectable({
    providedIn: 'root'
})
export class CoinService extends ApiCoreService<ICoin>{
    constructor(){
        super(ApiKeys.COINS);
    }

    public override async insert(object: ICoin): Promise<number | undefined>{
        throw Error("Not allowed");
    }

    public override async update(object: ICoin): Promise<boolean> {
        throw Error("Not allowed");
    }

    public override async delete(object: ICoin): Promise<boolean> {
        throw Error("Not allowed");
    }
}