#!/usr/bin/env bash
# 처음 한 번만: git 초기화 + 기본 브랜치 생성
set -e
git init -b main
git add -A
git commit -m "chore: React+TS+Vite 초기 세팅, SCR-01~09 뼈대, 상태·목데이터·UI 기반"
git branch dev
git branch --list
