class History{
    constructor(){
        this.selSince = this.getLocal("selSince") == null ? 2021 : this.getLocal("selSince");
        this.sinceList = this.getLocal(this.selSince) == null ? [] : this.getLocal(this.selSince);
        this.history_nav_list = this.getLocal("navList") == null ? [] : this.getLocal("navList");

        this.history_nav_area = document.querySelector("#history_nav");
        this.history_title = document.querySelector("#history_title");
        this.history_list = document.querySelector("#history_list");

        this.setPage(this.selSince == null ? "" : this.selSince);
        this.setEvent();
    }

    setEvent(){
        document.querySelector("#add_btn").addEventListener("click",()=>{this.addProccess()});
    }

    getLocal(table){return JSON.parse(localStorage.getItem(table));}
    setLocal(table,data){localStorage.setItem(table,JSON.stringify(data));}
    removeLocal(table){localStorage.removeItem(table);}

    setPage(title=""){
        if(title !== ""){
            this.setLocal("selSince",title);
            this.selSince = title;
            this.sinceList = this.getLocal(title) == null ? [] : this.getLocal(this.selSince);;
        }

        this.history_title.innerHTML = this.selSince;
        this.history_list.innerHTML = "";
        this.history_nav_area.innerHTML = "";
        if(this.history_nav_list.length) this.history_nav_list.forEach(x=>{this.make_history_nav_item(x)});
        if(this.sinceList.length) this.sinceList.forEach((x,idx)=>{this.make_history_item(idx,x.date,x.title)});
        else this.history_list.innerHTML = `<div class="noData">관련 정보가 없습니다.</div>`;
        
        if(this.history_nav_list.length == 0 && this.sinceList.length == 0) document.querySelector("#history_body").innerHTML = `<div class="noData p-2">관련 정보가 없습니다.</div>`;
    }

    addProccess(){
        let form = document.querySelector("#add_form");
        let title = form.add_title.value, date = form.add_date.value;
        if(title == "" || date == "") return alert("내용을 모두 입력해주세요.");

        let year = date.substr(0,4);
        let list = this.getLocal(year) == null ? [] : this.getLocal(year);

        list.push({"title":title,"date":date});
        list = this.dateSort(list);
        console.log(list);
        this.setLocal(year,list);

        if(this.history_nav_list.findIndex(date => date == year) == -1) {
            this.history_nav_list.push(year);
            this.history_nav_list = this.dateSort(this.history_nav_list);
            this.setLocal("navList",this.history_nav_list);
        }

        alert("연혁이 등록되었습니다.");
        document.querySelector("#add_popup_close").click();
        form.add_title.value = "";
        form.add_date.value = "";

        this.setPage(year);
    }

    dateSort(list){
        let temp = "";
        
        for(let i = 0; i < list.length; i++){
            for(let j = 0; j< i; j++){
                console.log((list[j].date > list[j+1].date));
                if(list[j].date > list[j+1].date){
                    temp = list[j];
                    list[j] = list[j+1];
                    list[j] = temp;
                    console.log(list[j],list[j+1],temp);
                }
            }
        }

        console.log(list);

        return list;
    }

    delProccess(idx){
        if(confirm("해당 연혁을 삭제하시겠습니까?")){
            let date = this.sinceList[idx].date.substr(0,4);
            this.sinceList.splice(idx,1);
            this.sinceList = this.dateSort(this.sinceList);
            if(this.sinceList.length) this.setLocal(date,this.sinceList);
            else{
                this.removeLocal(date);
                this.history_nav_list.splice(this.history_nav_list.findIndex(x => x == date),1);
                this.setLocal("navList",this.history_nav_list);
            }

            alert("해당 연혁이 삭제되었습니다.");
            this.setPage(this.selSince);
        }
    }

    modProccess(idx){
        let form = document.querySelector("#mod_form");
        let title = form.mod_title.value,date = form.mod_date.value,sel_year = this.sinceList[idx].date.substr(0,4),date_year = date.substr(0,4);
        let lastList = this.sinceList[idx],list = this.getLocal(date.substr(0,4));
        if(date !== sel_year) {
            lastList.splice(idx,1);
            this.setLocal(sel_year,lastList);
            
            list.push({"title":title,"date":date});
            list = this.dateSort(list);
            this.setLocal(date_year,list);
            
            if(this.history_nav_list.findIndex(date => date == date_year) == -1){
                this.history_nav_list.push(date_year);
                this.history_nav_list.sort((a,b)=>{if(a > b) return 1; else -1;});
                this.setLocal("navList",this.history_nav_list);
            }

        }else{
            list[idx] = {"title":title,"date":date};
            list = this.dateSort(list);
            this.setLocal(date_year,list);
        }

        alert("해당 연혁이 수정되었습니다.");
        this.setPage(date_year);
    }

    setMod(idx){
        let data = this.sinceList[idx];
        let form = document.querySelector("#mod_form");
        form.mod_title.value = data.title;
        form.mod_date.value = data.date;
    }

    make_history_nav_item(title){
        let flag = title == this.selSince ? "select" : "";
        let dom = document.createElement("div");
        dom.innerHTML = `<div class="history_link ${flag}">${title}</div>`;
        dom.querySelector(".history_link").addEventListener("click",e=>{this.setPage(e.target.innerHTML)});
        this.history_nav_area.appendChild(dom.firstChild);
    }

    make_history_item(idx,date,title){
        let dateSplit = date.split("-");
        let month = `${dateSplit[1]}.${dateSplit[2]}`;
        let dom = document.createElement("div");
        dom.innerHTML = `<div class="history_item">
                            <p class="history_content"><span class="history_date">${month}</span>${title}</p>
                            <div class="history_buttons">
                                <button class="button mod_history_open" data-idx="${idx}" data-target="#mod_popup" data-toggle="modal">수정</button>
                                <button class="button red del_history_btn" data-idx="${idx}">삭제</button>
                            </div>
                        </div>`;
        dom.querySelector(".mod_history_open").addEventListener("click",e=>{this.setMod(e.target.dataset.idx)});
        dom.querySelector(".del_history_btn").addEventListener("click",e=>{this.delProccess(e.target.dataset.idx)});
        this.history_list.appendChild(dom.firstChild);
    }
}

let app = new History();