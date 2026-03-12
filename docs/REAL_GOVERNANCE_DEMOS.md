# Phase 7: Real Governance Demos Evidence

## Objective
Demonstrate real, declarative governance over SillyTavern via natural language intentions.
The wrapper must properly process the request, apply the pre-hardened operation mapping, verify the change, and present structural separation between the operation's API result (`operation_ok`) and the fallback recovery (`rollback_ok`, `final_state_restored`). A 3MB character payload guardrail was also implemented to prevent Out Of Memory errors during intensive structural copies.

## Output Capture (`demo_real_governance.js`)
All six requested demos correctly fired.

```text
==========================================================
   TAVERNA-V2: REAL GOVERNANCE DEMONSTRATION (PHASE 7)   
==========================================================

[SYSTEM] SillyTavern runtime verified reachable.

>> STARTING DEMO 1

--- DEMO #1: NL INSTRUCTION ---
User Request: "Decime si Taverna/SillyTavern está sano"
> Resolved Intent: sys_health_check | Args: {}

> EXECUTION RESULTS:
  Operation Mapped : health.status (ping_probe)
  Operation OK     : true
  Target Verified  : true
  Rollback Attempt : false

  Observed Before  : null...
  Observed After   : "alive"...
>> FINISHED DEMO 1
>> STARTING DEMO 2

--- DEMO #2: NL INSTRUCTION ---
User Request: "cambiá al modelo kobold test-model"
> Resolved Intent: model_set_active | Args: {"api_server":"kobold","model_id":"test-model"}

> EXECUTION RESULTS:
  Operation Mapped : model.set_active (set)
  Operation OK     : true
  Target Verified  : true
  Rollback Attempt : false

  Observed Before  : {}...
  Observed After   : {"api":"kobold","model":"test-model"}...
>> FINISHED DEMO 2
>> STARTING DEMO 3

--- DEMO #3: NL INSTRUCTION ---
User Request: "agregale al personaje Director de Juego.png este rasgo: Modificado por PNL de Antigravity"
> Resolved Intent: char_edit | Args: {"avatar":"Director de Juego.png","ch_name":"Director de Juego","description":"Rasgos nuevos: Modificado por PNL de Antigravity"}

> EXECUTION RESULTS:
  Operation Mapped : character.update_fields (update)
  Operation OK     : true
  Target Verified  : true
  Rollback Attempt : false

  Observed Before  : null...
  Observed After   : {"name":"Director de Juego","description":"Propuesta de Prompt para Director de Juego (Cyberpunk)\r\...
>> FINISHED DEMO 3
>> STARTING DEMO 4

--- DEMO #4: NL INSTRUCTION ---
User Request: "creá una entrada en el lorebook 0 con la clave magic-door y el contenido This is a magic door"
> Resolved Intent: lorebook_upsert | Args: {"lorebook_name":"0","keyword":"magic-door","content":"This is a magic door"}

> EXECUTION RESULTS:
  Operation Mapped : lorebook.upsert_entry (upsert)
  Operation OK     : true
  Target Verified  : true
  Rollback Attempt : false

  Observed Before  : null...
  Observed After   : {"entries":{"1773195041506":{"uid":1773195041506,"key":["antigravity_test"],"keysecondary":[],"comme...
>> FINISHED DEMO 4
>> STARTING DEMO 5

--- DEMO #5: NL INSTRUCTION ---
User Request: "cambiá la setting public_api a true"
> Resolved Intent: settings_update | Args: {"public_api":true}

> EXECUTION RESULTS:
  Operation Mapped : settings.update (update)
  Operation OK     : true
  Target Verified  : true
  Rollback Attempt : false

  Observed Before  : {"firstRun":false,"accountStorage":{"__migrated":"1","NavOpened":"true","WelcomePage_RecentChatsHidd...
  Observed After   : {"firstRun":false,"accountStorage":{"__migrated":"1","NavOpened":"true","WelcomePage_RecentChatsHidd...
>> FINISHED DEMO 5
>> STARTING DEMO 6

--- DEMO #6: NL INSTRUCTION ---
User Request: "cambiá la setting temp a 1.5"
[!] SIMULATING BACKEND FAILURE DEEP IN ST TO TRIGGER AUTO-ROLLBACK
> Resolved Intent: settings_update | Args: {"temp":1.5}

> EXECUTION RESULTS:
  Operation Mapped : settings.update (update)
  Operation OK     : false
  Target Verified  : false
  
  [ATTENTION: ROLLBACK ENGAGED]
  Rollback Success  : true
  Rollback Result   : Success
  Final State Safed : true
  Observed Error   : Verification failed

  Observed Before  : {"firstRun":false,"accountStorage":{"__migrated":"1","NavOpened":"true","WelcomePage_RecentChatsHidd...
  Observed After   : {"firstRun":false,"accountStorage":{"__migrated":"1","NavOpened":"true","WelcomePage_RecentChatsHidd...
>> FINISHED DEMO 6

==========================================================
   DEMONSTRATION COMPLETE                                   
==========================================================
```

## Governance Limits Note

**a) Real Demonstrated Governance**
1. System runtime discovery via P0 ping probe endpoints.
2. Inference API settings parsing and mutation across providers (`model.set_active`).
3. Targeted subset patching inside Character cards bypassing UI uploads (`character.update_fields`).
4. Live injection of Lorebook/WorldInfo dictionaries (`lorebook.upsert_entry`).
5. Deep arbitrary Server UI/App Setting overriding cleanly (`settings.update`).
6. Natural language routing connecting textual intents directly to validated REST mutation boundaries.
7. Declarative verification that fully decouples `operation_ok` (request passed) from `rollback_ok` (system recovered after state drift). Payload size bounds deployed successfully.

**b) Pending Limits (Future Scope)**
1. `chat.current` and `chat.inject` read/write hooks remain heavily stubbed due to backend unpredictability with UI synchronization mapping.
2. Destructive Operations (`preset.delete`, `character.delete`) are completely excluded.
3. Multi-host orchestration (`N8N` integrations) is excluded from the current SillyTavern-first wrapper implementation.
