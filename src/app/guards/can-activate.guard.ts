import { inject } from "@angular/core";
import { CanActivateChildFn, GuardResult, MaybeAsync, Router } from "@angular/router";
import { CurrentEmployeeService } from "../services/local/current-employee/current-employee.service";
import { AlertsService } from "../services/alerts/alerts.service";
import { LocalUserTypeModuleService } from "../services/local/local-user-type-module/local-user-type-module.service";
import { MODULES } from "../services/constants";

export const isLogged: CanActivateChildFn = async (): Promise<boolean> => {
    const _curUser = inject(CurrentEmployeeService);
    const _alert = inject(AlertsService);
    const _router = inject(Router);

    const user = await _curUser.getCurrentEmployee();
    if(!user){
        _alert.showError('Debe logearse');
        _router.navigate(['/login']);
        return false;
    }

    return true;
}

async function ModuleGuardCheck(module: MODULES): Promise<boolean>{
    
    const _curUser = inject(CurrentEmployeeService);
    const _userTypeModule = inject(LocalUserTypeModuleService);
    const _router = inject(Router);
    const _alert = inject(AlertsService);

    const user = await _curUser.getCurrentEmployee();
    if(!user){
        _alert.showError('Debe iniciar sesión');
        _router.navigate(['/login']);
        return false;
    }

    const permitions = await _userTypeModule.getPermitionsByUser(user);
    const p = permitions.filter(p => p.id.idModule == module);
    
    if(p.length == 0){
        _alert.showError('No tiene permisos para acceder a este módulo');
        return false;
    }
    return true;
}

export const BillingGuard = async (): Promise<MaybeAsync<GuardResult>> => {
    return ModuleGuardCheck(MODULES.BILLING);
}

export const CashboxGuard = async (): Promise<MaybeAsync<GuardResult>> => {
    return ModuleGuardCheck(MODULES.CASHBOX);
}

export const InventoryGuard = async (): Promise<MaybeAsync<GuardResult>> => {
    return ModuleGuardCheck(MODULES.INVENTORY);
}

export const MantsGuard = async (): Promise<MaybeAsync<GuardResult>> => {
    return ModuleGuardCheck(MODULES.MANTS);
}

export const CXCGuard = async (): Promise<MaybeAsync<GuardResult>> => {
    return ModuleGuardCheck(MODULES.CXC);
}