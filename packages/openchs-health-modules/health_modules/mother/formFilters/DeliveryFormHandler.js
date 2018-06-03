import FormElementStatusBuilder from "../../../../rules-config/src/rules/builders/FormElementStatusBuilder";

class DeliveryFormHandler {
    dateOfDischarge(programEncounter, formElement) {
        const statusBuilder = new FormElementStatusBuilder({programEncounter: programEncounter, formElement: formElement});
        statusBuilder.show().when.valueInEncounter("Place of delivery").not.containsAnswerConceptName("Home");
        return statusBuilder.build();
    }
}

export default DeliveryFormHandler;