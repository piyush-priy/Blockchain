"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const events_service_1 = require("./events.service");
describe('EventsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [events_service_1.EventsService],
        }).compile();
        service = module.get(events_service_1.EventsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
