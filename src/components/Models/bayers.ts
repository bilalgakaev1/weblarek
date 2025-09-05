import { IBuyer, TPayment } from "../../types";

export class Bayer implements IBuyer {
    address: string;
    phone: string;
    email: string;
    payment: TPayment;

    constructor(payment: TPayment, address: string, phone: string, email: string) {
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.payment = payment;
    }

    getData(): object {
        return {
            address: this.address,
            phone: this.phone,
            email: this.email,
            payment: this.payment,
        }; 
    }

    clear(): void {
        this.address = '';
        this.payment = null;
        this.email = '';
        this.phone = '';
    }

    validate(): boolean {
         
        if (this.address.length > 0 &&
            this.email.includes("@") &&
            this.phone.length > 0 &&
            this.payment != null) {
            return true;
        } else {
            return false;
        }
        
    }

}