export class User {
    id: string;
    email: string;
    password: string;
    name: string | null;
    role: string;
  
    constructor(
      id: string,
      email: string,
      password: string,
      name: string | null,
      role: string
    ) {
      this.id = id;
      this.email = email;
      this.password = password;
      this.name = name;
      this.role = role;
    }
  }