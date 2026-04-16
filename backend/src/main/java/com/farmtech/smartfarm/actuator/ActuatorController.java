package com.farmtech.smartfarm.actuator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/actuator")
public class ActuatorController {

    @Autowired
    private ActuatorService actuatorService;

    // ── 모드 조회 / 전환 ───────────────────────────
    @GetMapping("/mode")
    public ResponseEntity<?> getMode() {
        return ResponseEntity.ok(actuatorService.getMode());
    }

    @PostMapping("/mode")
    public ResponseEntity<?> setMode(@RequestParam String mode) {
        return ResponseEntity.ok(actuatorService.setMode(mode));
    }

    // ── LED 제어 ───────────────────────────────────
    @PostMapping("/led/on")
    public ResponseEntity<?> ledOn(
            @RequestParam(defaultValue = "1.0") double brightness) {
        return ResponseEntity.ok(actuatorService.ledOn(brightness));
    }

    @PostMapping("/led/off")
    public ResponseEntity<?> ledOff() {
        return ResponseEntity.ok(actuatorService.ledOff());
    }

    // ── 부저 제어 ──────────────────────────────────
    @PostMapping("/buzzer/on")
    public ResponseEntity<?> buzzerOn(
            @RequestParam(defaultValue = "440") int freq) {
        return ResponseEntity.ok(actuatorService.buzzerOn(freq));
    }

    @PostMapping("/buzzer/off")
    public ResponseEntity<?> buzzerOff() {
        return ResponseEntity.ok(actuatorService.buzzerOff());
    }

    // ── 팬 제어 ────────────────────────────────────
    @PostMapping("/fan/on")
    public ResponseEntity<?> fanOn(@RequestParam(defaultValue = "1.0") double speed) {
      return ResponseEntity.ok(actuatorService.fanOn(speed));
    }

    @PostMapping("/fan/off")
    public ResponseEntity<?> fanOff() {
      return ResponseEntity.ok(actuatorService.fanOff());
    }

    // ── 전체 상태 조회 ─────────────────────────────
    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(actuatorService.getStatus());
    }
}
