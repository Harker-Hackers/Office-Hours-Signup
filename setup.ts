import { autoSlotHandler, JSONSlotGenerator } from "./util/autoSlotHandler";

export default ()=>{
    autoSlotHandler.deleteOldSlots().catch(()=>{})
    /*let gen = new JSONSlotGenerator(JSONSlotGenerator.createJSONSlotConfig({
        '2022-05-02':[
            {startTime:'15:00:00',endTime:'15:30:00'},
            {startTime:'15:30:00',endTime:'15:45:00'},
            {startTime:'15:45:00',endTime:'16:00:00'}
        ], '2022-05-03':[
            {startTime:'15:00:00',endTime:'15:30:00'},
            {startTime:'15:30:00',endTime:'15:45:00'},
            {startTime:'15:45:00',endTime:'16:00:00'}
        ]
    }))
    gen.createSlots('113315261099846298265')*/
}
