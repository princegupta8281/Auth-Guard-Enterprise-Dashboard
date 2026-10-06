package com.example.demo.controller;

import com.example.demo.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(
            FileStorageService fileStorageService) {

        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file) {

        String filePath =
                fileStorageService.saveFile(file);

        return ResponseEntity.ok(
                "File uploaded successfully: " + filePath
        );
    }
}