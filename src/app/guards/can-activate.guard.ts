import { inject } from "@angular/core";
import { CanActivateChildFn, Router } from "@angular/router";
import { CurrentEmployeeService } from "../services/local/current-employee/current-employee.service";
import { AlertsService } from "../services/alerts/alerts.service";

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