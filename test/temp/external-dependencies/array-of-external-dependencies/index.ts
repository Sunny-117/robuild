
          import React from 'react'
          import ReactDOM from 'react-dom'
          import Vue from 'vue'
          import { Component } from '@angular/core'
          
          export function createReactApp(): JSX.Element {
            return React.createElement('div', null, 'Hello React')
          }
          
          export function renderReact(element: JSX.Element): void {
            ReactDOM.render(element, document.body)
          }
          
          export const vueApp = Vue.createApp({})
          
          export class AngularComponent {
            constructor() {}
          }
        