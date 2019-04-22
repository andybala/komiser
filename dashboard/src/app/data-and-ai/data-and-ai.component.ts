import { Component, OnInit } from '@angular/core';
import { AwsService } from '../aws.service';

declare var Chart: any;
declare var $: any;
declare var window: any;
declare var Circles: any;
import * as Chartist from 'chartist';
import 'chartist-plugin-tooltips';

@Component({
  selector: 'app-data-and-ai',
  templateUrl: './data-and-ai.component.html',
  styleUrls: ['./data-and-ai.component.css']
})
export class DataAndAiComponent implements OnInit {

  public sqsQueues: number = 0;
  public numberOfMessagesSentToday: number = 0;
  public numberOfMessagesDeletedToday: number = 0;
  public snsTopics: number = 0;
  public activemqBrokers: number = 0; 
  public kinesisStreams: number = 0;
  public kinesisShards: number = 0;
  public glueJobs: number = 0;
  public glueCrawlers: number = 0;
  public dataPipelines: number = 0;
  public esDomains: number = 0;
  public swfDomains: number = 0;

  private loadingSQS: boolean = true;
  private loadingSQSMessages: boolean = true;
  public loadingSNS: boolean = true;
  public loadingGlueCrawlers: boolean = true;
  public loadingActiveMQBrokers: boolean = true;
  public loadingGlueJobs: boolean = true;
  public loadingSwfDomains: boolean = true;
  public loadingDataPipelines: boolean = true;
  public loadingKinesisStreams: boolean = true;
  public loadingKinesisShards: boolean = true;
  public loadingESDomains: boolean = true;
  public loadingSQSMessagesChart: boolean = true;

  constructor(private awsService: AwsService) {
    this.awsService.getSQSPublishedMessagesMetrics().subscribe(data => {
      this.numberOfMessagesSentToday = data[0].Datapoints[Object.keys(data[0].Datapoints)[Object.keys(data[0].Datapoints).length - 1]]
      this.numberOfMessagesDeletedToday = data[1].Datapoints[Object.keys(data[1].Datapoints)[Object.keys(data[1].Datapoints).length - 1]]

      this.loadingSQSMessages = false;

      let seriesSent = [];
      let seriesDeleted = [];
      let labels = [];
      let i = 0;
      Object.keys(data[0].Datapoints).forEach(key => {
        labels.push(key)
        seriesSent.push({
          meta: 'NumberOfMessagesSent',
          value: data[0].Datapoints[key]
        })
        seriesDeleted.push({
          meta: 'NumberOfMessagesDeleted',
          value: data[1].Datapoints[key]
        })
      })


      this.loadingSQSMessagesChart = false;
      this.showSQSMessages(labels, [
        seriesSent,
        seriesDeleted
      ]);
    }, err => {
      this.loadingSQSMessagesChart = false;
      this.loadingSQSMessages = false;
      console.log(err);
    })

    this.awsService.getSQSQueues().subscribe(data => {
      this.sqsQueues = data;
      this.loadingSQS = false;
    }, err => {
      this.sqsQueues = 0;
      this.loadingSQS = false;
    })

    this.awsService.getSNSTopics().subscribe(data => {
      this.snsTopics = data;
      this.loadingSNS = false;
    }, err => {
      this.snsTopics = 0;
      this.loadingSNS = false;
    });

    this.awsService.getActiveMQBrokers().subscribe(data => {
      this.activemqBrokers = data;
      this.loadingActiveMQBrokers = false;
    }, err => {
      this.activemqBrokers = 0;
      this.loadingActiveMQBrokers = false;
    });

    this.awsService.getKinesisShards().subscribe(data => {
      this.kinesisShards = data;
      this.loadingKinesisShards = false;
    }, err => {
      this.kinesisShards = 0;
      this.loadingKinesisShards = false;
    });

    this.awsService.getKinesisStreams().subscribe(data => {
      this.kinesisStreams = data;
      this.loadingKinesisStreams = false;
    }, err => {
      this.kinesisStreams = 0;
      this.loadingKinesisStreams = false;
    });

    this.awsService.getGlueCrawlers().subscribe(data => {
      this.glueCrawlers = data;
      this.loadingGlueCrawlers = false;
    }, err => {
      this.glueCrawlers = 0;
      this.loadingGlueCrawlers = false;
    });

    this.awsService.getGlueJobs().subscribe(data => {
      this.glueJobs = data;
      this.loadingGlueJobs = false;
    }, err => {
      this.glueJobs = 0;
      this.loadingGlueJobs = false;
    });

    this.awsService.getDataPipelines().subscribe(data => {
      this.dataPipelines = data;
      this.loadingDataPipelines = false;
    }, err => {
      this.dataPipelines = 0;
      this.loadingDataPipelines = false;
    });

    this.awsService.getESDomains().subscribe(data => {
      this.esDomains = data;
      this.loadingESDomains = false;
    }, err => {
      this.esDomains = 0;
      this.loadingESDomains = false;
    });

    this.awsService.getSWFDomains().subscribe(data => {
      this.swfDomains = data;
      this.loadingSwfDomains = false;
    }, err => {
      this.swfDomains = 0;
      this.loadingSwfDomains = false;
    });
  }

  ngOnInit() {
  }

  private formatNumber(labelValue) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+9

      ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(2) + " B"
      // Six Zeroes for Millions 
      : Math.abs(Number(labelValue)) >= 1.0e+6

        ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(2) + " M"
        // Three Zeroes for Thousands
        : Math.abs(Number(labelValue)) >= 1.0e+3

          ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + " K"

          : Math.abs(Number(labelValue));
  }

  private showSQSMessages(labels, series) {
    let scope = this;
    new Chartist.Bar('#sqsMessagesChart', {
      labels: labels,
      series: series
    }, {
        plugins: [
          Chartist.plugins.tooltip()
        ],
        stackBars: true,
        axisY: {
          offset: 80,
          labelInterpolationFnc: function (value) {
            return scope.formatNumber(value);
          }
        }
      }).on('draw', function (data) {
        if (data.type === 'bar') {
          data.element.attr({
            style: 'stroke-width: 30px'
          });
        }
      });

  }
}
