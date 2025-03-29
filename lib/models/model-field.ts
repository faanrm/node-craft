export interface ModelField {
    name: string;
    type: string;
    isOptional: boolean;
    isUnique: boolean;
    isRelation?: boolean;
    relationModel?: string;
    relationType?: 'OneToOne' | 'OneToMany' | 'ManyToMany';
}