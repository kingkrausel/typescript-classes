class Collection {
        private unique = false;
        private equal: (a: any, b: any) => bool;
        private object: any[];
        private sort: (a: any, b: any) => number;
        private attr: number;
        /** Allow mutiple equal objects in your collection? 
            When are two objects equal?
        */
        constructor(unique?: bool, equal?: (a:any,b:any)=>bool) {
            super();
            this.attr = 0;
            if (unique != undefined) {
                this.unique = unique;
            }
            
            if (this.unique == false)
                this.equal = (a, b) => { return false; };
            else {
                if (equal == undefined) { console.error("function 'equal' must be defined!"); return null;}
                this.equal = equal;
            }
            this.object = [];
        }
        public keepSortedWith(sort:(a,b)=>number) {
            this.sort = sort;
        }
        /**
        Adds an object to the Collection, if the Collection doesn't contain this object already.
        Returns true if the object was inserted, else false.
        Notifys all observers and passes the index to of the added object.
        */
        public addObject(object: any): bool {
            
            var index= -1;
            if (this.sort && this.unique) {
                if (this.getEqualObject(object)) return false;
                var len = this.object.length;
                for (var i = 0; i < len; i++) {
                    if (this.sort(object, this.object[i]) < 0) {
                        this.object.splice(i, 0, object);
                        index = i;
                        break;
                    }
                }
                if (index == -1) {
                    this.object.push(object);
                    index = len;//richtig dass alte Laenge genommen wird!
                }
            } else {
                console.log("Collection must be sorted and unique, currently. (Contact: -)");
            }
            return true;
        }

        public getObjects(offset?:number){
            if (offset != undefined) {
                var len = this.object.length;
                return this.object.slice(offset, len);
            }
            return this.object;
        }

        public getObjectsWith(valid: (a) => bool) {
            var res = [];
            this.object.forEach((obj) => {
                if (valid(obj)) {
                    res.push(obj);
                }
            });
            return res;
        }
        public getLast() {
            if (this.object.length == 0) return null;
            return this.object[this.object.length-1];
        }

        public getPartialObjectsWith(valid: (a) => bool, partial: (a) => any) {
            //Returns an array of all objects which return true for the function valid
            var res = [];
            var i = 0;
            this.object.forEach((obj) => {
                if (valid(obj)) {
                    res.push({obj:partial(obj), index:i});
                }
                i++;
            });
            return res;
        }

        public getObjectByIndex(i: number) {
            if (i >= this.object.length || i < 0) return null;
            return this.object[i];
        }

        public addObjects(objs: any[]) {
            var oldLen = this.object.length;
            this.object = this.object.concat(objs);
            this.notifyObservers(oldLen);
        }
        /** Returns the index of the first object which is true for equal(obj) => bool */
        public getIndexBy(equal: (obj: any) => bool) {
            var len = this.object.length;
            for (var i = 0; i < len; i++) {
                if (equal(this.object[i])) return i;
            }
            return -1;
        }
        /** Returns an array with length of 2 which contains the object and its index
        null is returned if there is no object which equals to obj.
        */
        public getEqualObject(obj) {
            for (var i = 0; i < this.object.length; i++) {
                if (this.equal(obj, this.object[i])) return [this.object[i],i];
            }
            return null;
        }

        /** Updates an objects which equals to oldObj. If there are no matches, newObj will be added.*/
        public update(oldObj, newObj) {
            var gotIt = this.getEqualObject(oldObj);
            if (gotIt != null) {
                this.object.splice(gotIt[1], 1);
            }
            this.addObject(newObj);
        }

        public removeObject(obj) {
            var gotIt = this.getEqualObject(obj);
            if (gotIt != null) {
                this.object.splice(gotIt[1], 1);
            }
        }
        /**
        removes all objects which return true for select.
        @param method which returns a boolean.
        */
        public removeBy(select: (item: any) => bool) {
            for (var i = 0; i < this.object.length; i++) {
                if (select(this.object[i])) {
                    this.removeByIndex(i);
                    i--;
                }
            }
        }

        public removeByIndex(i: number) {
            this.object.splice(i, 1);
        }

        public clear() {
            this.object = [];
        }
  }
