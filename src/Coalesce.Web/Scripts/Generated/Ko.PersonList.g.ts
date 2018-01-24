
/// <reference path="../coalesce.dependencies.d.ts" />

// Knockout List View Model for: Person
// Generated by IntelliTect.Coalesce

module ListViewModels {

    export namespace PersonDataSources {
                
        export class WithoutCases extends Coalesce.DataSource<ViewModels.Person> {
        }
        export const Default = WithoutCases;
        
        export class NamesStartingWithAWithCases extends Coalesce.DataSource<ViewModels.Person> {
        }
        
        /** People whose last name starts with B or c */
        export class BorCPeople extends Coalesce.DataSource<ViewModels.Person> {
        }
    }

    export class PersonList extends Coalesce.BaseListViewModel<ViewModels.Person> {
        public readonly modelName: string = "Person";
        public readonly apiController: string = "/Person";
        public modelKeyName: string = "personId";
        public itemClass: new () => ViewModels.Person = ViewModels.Person;

        public filter: {
            personId?:string;
            title?:string;
            firstName?:string;
            lastName?:string;
            email?:string;
            gender?:string;
            birthDate?:string;
            lastBath?:string;
            nextUpgrade?:string;
            companyId?:string;
        } = null;
    
        /** 
            The namespace containing all possible values of this.dataSource.
        */
        public dataSources: typeof PersonDataSources = PersonDataSources;

        /**
            The data source on the server to use when retrieving objects.
            Valid values are in this.dataSources.
        */
        public dataSource: Coalesce.DataSource<ViewModels.Person> = new this.dataSources.Default();

        public static coalesceConfig = new Coalesce.ListViewModelConfiguration<PersonList, ViewModels.Person>(Coalesce.GlobalConfiguration.listViewModel);
        public coalesceConfig: Coalesce.ListViewModelConfiguration<PersonList, ViewModels.Person>
            = new Coalesce.ListViewModelConfiguration<PersonList, ViewModels.Person>(PersonList.coalesceConfig);

        public static Add = class Add extends Coalesce.ClientMethod<PersonList, number> {
            public readonly name = 'Add';
            
            /** Calls server method (Add) with the given arguments */
            public invoke = (numberOne: number, numberTwo: number, callback: (result: number) => void = null, reload: boolean = true): JQueryPromise<any> => {
                return this.invokeWithData({ numberOne: numberOne, numberTwo: numberTwo }, callback, reload);
            };
            
            public static Args = class Args {
                public numberOne: KnockoutObservable<number> = ko.observable(null);
                public numberTwo: KnockoutObservable<number> = ko.observable(null);
            };
            
            /** Calls server method (Add) with an instance of Add.Args, or the value of this.args if not specified. */
            public invokeWithArgs = (args = this.args, callback?: (result: number) => void, reload: boolean = true) => {
                return this.invoke(args.numberOne(), args.numberTwo(), callback, reload);
            }
            
            /** Object that can be easily bound to fields to allow data entry for the method's parameters */
            public args = new Add.Args();
            
            protected loadResponse = (data: any, callback?: (result: number) => void, reload?: boolean) => {
                this.result(data);
                if (typeof(callback) != 'function') return;
                if (reload) {
                    var result = this.result();
                    this.parent.load(() => callback(result));
                } else {
                    callback(this.result());
                }
            };
            /** Invokes the method after displaying a browser-native prompt for each argument. */
            public invokeWithPrompts = (callback: (result: number) => void = null, reload: boolean = true): JQueryPromise<any> => {
                var $promptVal: string = null;
                $promptVal = prompt('Number One');
                if ($promptVal === null) return;
                var numberOne: number = parseInt($promptVal);
                $promptVal = prompt('Number Two');
                if ($promptVal === null) return;
                var numberTwo: number = parseInt($promptVal);
                return this.invoke(numberOne, numberTwo, callback, reload);
            };
        };
        
        /**
            Methods and properties for invoking server method Add.
            Adds two numbers.
        */
        public readonly add = new PersonList.Add(this);
        
        public static GetUser = class GetUser extends Coalesce.ClientMethod<PersonList, string> {
            public readonly name = 'GetUser';
            
            /** Calls server method (GetUser) with the given arguments */
            public invoke = (callback: (result: string) => void = null, reload: boolean = true): JQueryPromise<any> => {
                return this.invokeWithData({  }, callback, reload);
            };
            
            protected loadResponse = (data: any, callback?: (result: string) => void, reload?: boolean) => {
                this.result(data);
                if (typeof(callback) != 'function') return;
                if (reload) {
                    var result = this.result();
                    this.parent.load(() => callback(result));
                } else {
                    callback(this.result());
                }
            };
            /** Invokes the method after displaying a browser-native prompt for each argument. */
            public invokeWithPrompts = (callback: (result: string) => void = null, reload: boolean = true): JQueryPromise<any> => {
                var $promptVal: string = null;
                return this.invoke(callback, reload);
            };
        };
        
        /**
            Methods and properties for invoking server method GetUser.
            Returns the user name
        */
        public readonly getUser = new PersonList.GetUser(this);
        
        public static GetUserPublic = class GetUserPublic extends Coalesce.ClientMethod<PersonList, string> {
            public readonly name = 'GetUserPublic';
            
            /** Calls server method (GetUserPublic) with the given arguments */
            public invoke = (callback: (result: string) => void = null, reload: boolean = true): JQueryPromise<any> => {
                return this.invokeWithData({  }, callback, reload);
            };
            
            protected loadResponse = (data: any, callback?: (result: string) => void, reload?: boolean) => {
                this.result(data);
                if (typeof(callback) != 'function') return;
                if (reload) {
                    var result = this.result();
                    this.parent.load(() => callback(result));
                } else {
                    callback(this.result());
                }
            };
            /** Invokes the method after displaying a browser-native prompt for each argument. */
            public invokeWithPrompts = (callback: (result: string) => void = null, reload: boolean = true): JQueryPromise<any> => {
                var $promptVal: string = null;
                return this.invoke(callback, reload);
            };
        };
        
        /**
            Methods and properties for invoking server method GetUserPublic.
            Returns the user name
        */
        public readonly getUserPublic = new PersonList.GetUserPublic(this);
        
        public static NamesStartingWith = class NamesStartingWith extends Coalesce.ClientMethod<PersonList, string[]> {
            public readonly name = 'NamesStartingWith';
            
            /** Calls server method (NamesStartingWith) with the given arguments */
            public invoke = (characters: string, callback: (result: string[]) => void = null, reload: boolean = true): JQueryPromise<any> => {
                return this.invokeWithData({ characters: characters }, callback, reload);
            };
            
            public static Args = class Args {
                public characters: KnockoutObservable<string> = ko.observable(null);
            };
            
            /** Calls server method (NamesStartingWith) with an instance of NamesStartingWith.Args, or the value of this.args if not specified. */
            public invokeWithArgs = (args = this.args, callback?: (result: string[]) => void, reload: boolean = true) => {
                return this.invoke(args.characters(), callback, reload);
            }
            
            /** Object that can be easily bound to fields to allow data entry for the method's parameters */
            public args = new NamesStartingWith.Args(); 
            
            protected loadResponse = (data: any, callback?: (result: string[]) => void, reload?: boolean) => {
                this.result(data);
                if (typeof(callback) != 'function') return;
                if (reload) {
                    var result = this.result();
                    this.parent.load(() => callback(result));
                } else {
                    callback(this.result());
                }
            };
            /** Invokes the method after displaying a browser-native prompt for each argument. */
            public invokeWithPrompts = (callback: (result: string[]) => void = null, reload: boolean = true): JQueryPromise<any> => {
                var $promptVal: string = null;
                $promptVal = prompt('Characters');
                if ($promptVal === null) return;
                var characters: string = $promptVal;
                return this.invoke(characters, callback, reload);
            };
        };
        
        /**
            Methods and properties for invoking server method NamesStartingWith.
            Gets all the first names starting with the characters.
        */
        public readonly namesStartingWith = new PersonList.NamesStartingWith(this);
        

        protected createItem = (newItem?: any, parent?: any) => new ViewModels.Person(newItem, parent);

        constructor() {
            super();
        }
    }
}